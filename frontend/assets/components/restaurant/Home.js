import React, { useEffect, useState } from 'react'
import Navigation from './Navigation';
import '../../css/home.css'
import kitchen from "../../svg/plate.svg";
import fast from "../../svg/fast.svg"
import order from "../../svg/waiter.svg"
import { menu, menu_items, menu_items } from '../../js/near/utils';

export default function Home({restaurant}) {
  // const hash = hello(restaurant._id);
  // console.log(hash);
  const [menu, setMenu] = useState([])
  const [foodIn, setFoodIn] = useState("")
  const [foodList, setFoodList] = useState([])

  const menus = async () => {
    let menu_data = await menu_items(
      restaurant._id || "5eb3d668b31de5d588f42936"
    );
    setMenu(menu_data)
    console.log('menu_items', menu_data)
  }

  useEffect(() => {
    menus()
  }, [])

  
  
    function addFood(e) {
      const food = e.target.value;
      if (food === "") {
        setFoodIn("")
      }
    }

    function addFoods(){
      foodList.push(foodIn)
      setFoodIn("")
    }

    function dropChoice(dropFood){
      foodList.filter(food => food != dropFood)
    }
    
    const menu_list = menu.map((menu_item) => {
    return (
      <div
        className="menu_item d-flex justify-content-between w-70"
        key={menu_item[1]}
      >
        <h3>{menu_item[0]}</h3>
        <h3>{menu_item[1]} Ⓝ</h3>
        {console.log(menu_item[0])}
      </div>
    );})

    const foodChoices = foodList.map((food) => {
      return (
        <div className="food_choices">
          <h4>{food}</h4>
          <button onClick={() => dropChoice(food)}>Drop choice</button>
        </div>
      )
    })

  return (
    <div className='m-0 home-page'>
      <div className="nav">
        <Navigation />
      </div>
      <div className="main-cont">
        <section className="about d-flex">
          <h2>Welcome to {restaurant.name}</h2>
          <h4>Main cuisine: {restaurant.cuisine}</h4>
          <div className="d-flex">
            <img src={kitchen}></img>
            <img src={fast}></img>
          </div>
          <h6>Address: {`${restaurant.address?.building} ${restaurant.address?.street}, ${restaurant.address?.zipcode}`}</h6>
          <button onClick={() => {}}>Make an order</button>
        </section>

        <section className="menu">
          <h2>CUISINES</h2>
          <h4>Platos Delicious</h4>
          {menu_list}
        </section>
        <section className="order">
          <div className="welc">
            <img src={order} alt="order"></img>
            <h2>What would you like</h2>
          </div>
          <div className="choose d-flex justify-content-between">
            <input type="text" name="food" value={foodIn} onChange={addFood}></input>
            <button className="btn btn-primary" onClick={addFoods}>add cuisine</button>
          </div>
          <div className="choices">
            {foodChoices}
          </div>
        </section>

        <section className="stats">
          stats
        </section>
      </div>
    </div>
  );
}
