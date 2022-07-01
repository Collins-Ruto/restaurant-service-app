import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import "../../css/home.css";
import kitchen from "../../svg/plate.svg";
import fast from "../../svg/fast.svg";
import orders from "../../svg/waiter.svg";
import enjoy from "../../svg/cocktail.svg";
import { order, pay, menu_items, menu_items, reciept } from "../../js/near/utils";

export default function Home({ restaurant }) {
  const [menu, setMenu] = useState([]);
  const [foodIn, setFoodIn] = useState("");
  const [foodList, setFoodList] = useState(["prawns", "fried egg"]);
  const [isConfirm, setIsConfirm] = useState(false);
  const [cost, setCost] = useState(0);
  const [table, setTable] = useState();
  const [tempTable, setTempTable] = useState();
  const [payStatus, setPayStatus] = useState("")

  const menus = async () => {
    let menu_data = await menu_items(
      restaurant._id || "5eb3d668b31de5d588f42936"
    );
    setMenu(menu_data);
    console.log("menu_items", menu_data);
  };

  useEffect(() => {
    menus();
  }, []);

  function addFood(e) {
    const food = e.target.value;
    if (food === "") {
      setFoodIn("");
      return;
    }
    setFoodIn(food);
  }

  function addFoods(foodTap) {
    if (foodTap) {
      foodList.push(foodTap)
      setFoodIn("")
    }
    if (foodIn === "") {return}
    foodList.push(foodIn);
    setFoodIn("");
  }

  function dropChoice(dropFood) {
    newFood = foodList.filter((food) => food != dropFood);
    setFoodList(newFood);
  }

  const confirm = async () => {
    if (!isConfirm) {
      await order(
        restaurant._id || "5eb3d668b31de5d588f42936",
        table,
        foodList
      );
      await reciept(restaurant._id || "5eb3d668b31de5d588f42936", table).then(
        (cost) => setCost(cost)
      );
      setIsConfirm(true);
      setFoodList([]);
    }
  };

  const tableUpdate = (e) => {
    let tableint = parseInt(e.target.value);
    setTempTable(tableint);
  };
  const tableNum = () => {
    setTable(tempTable);
  };

  const payCall = async () => {
    await pay(restaurant._id || "5eb3d668b31de5d588f42936",
    table, cost).then((status) => {setPayStatus(status)});
  };

  console.log("costs" + Number(cost * 10 ** 24));

  const menu_list = menu.map((menu_item, index) => {
    return (
      <div
        className="menu_item d-flex justify-content-between w-70"
        key={index}
        onClick={() =>{addFoods(menu_item[0])}}
      >
        <h3>{menu_item[0]}</h3>
        <h3>{menu_item[1]} Ⓝ</h3>
        {console.log(menu_item[0])}
      </div>
    );
  });

  const foodChoices = foodList.map((food, index) => {
    return (
      <div className="food_choices d-flex" key={index}>
        <h4>{food}</h4>
        <button onClick={() => dropChoice(food)}>Drop choice</button>
      </div>
    );
  });

  return (
    <div className="m-0 home-page">
      <div className="nav">
        <Navigation />
      </div>
      <div className="main-cont">
        <section className="about d-flex" id="home">
          <h2>Welcome to {restaurant.name}</h2>
          <h4>Main cuisine: {restaurant.cuisine}</h4>
          <div className="d-flex">
            <img src={kitchen}></img>
            <img src={fast}></img>
          </div>
          <h6>
            Address:{" "}
            {`${restaurant.address?.building} ${restaurant.address?.street}, ${restaurant.address?.zipcode}`}
          </h6>
          <button onClick={() => {}}>Make an order</button>
        </section>

        <section className="menu" id="menu">
          <h2>CUISINES</h2>
          <h4>Platos Delicious</h4>
          {menu_list}
        </section>
        <section className="order" id="order">
          <div className="welc">
            <img src={orders} alt="" />
            {table ? (
              <h4>What would you like for your table?</h4>
            ) : (
              <h4>Please enter your table number</h4>
            )}
          </div>
          {!table ? (
            <div className="tables d-flex justify-content-center">
              <input
                className="me-4"
                type="number"
                value={tempTable}
                name="table"
                placeholder="Table number"
                onChange={tableUpdate}
              />
              <button className="btn btn-primary" onClick={tableNum}>
                confirm
              </button>
            </div>
          ) : (
            <div className="choose d-flex justify-content-center">
              <input
                type="text"
                name="food"
                value={foodIn}
                onChange={addFood}
                placeholder="Your food choice"
              ></input>
              <button className="btn btn-primary" onClick={addFoods}>
                add cuisine
              </button>
            </div>
          )}

          {isConfirm ? (
            <div className="costs text-center mt-5">
              <h3>Table no: {table}</h3>
              <h3 className="mb-4">Your order is confirmed, enjoy!</h3>
              <img src={enjoy} alt="enjoy"></img>
              <h4 className="mt-3">Your bill is: {cost} Ⓝ</h4>
              <button onClick={payCall}>pay</button>
            </div>
          ) : (
            <>
              <div className="choices">{foodChoices}</div>
              <div className="confirm text-center mt-3">
                <button onClick={confirm}>Confirm Order</button>
              </div>
            </>
          )}
          <div className="info">
            <small>
              Note: add item multiple times for multiple order of the same{" "}
            </small>
          </div>
        </section>
        {/* <section className="stats" id="about">stats</section> */}
      </div>
    </div>
  );
}
