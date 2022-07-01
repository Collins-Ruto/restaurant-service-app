import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RestaurantDataService from "../../services/restaurant";
import { get_restaurants, logout, new_restaurant } from "../js/near/utils";

const RestaurantsList = ({setRestaurant}) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchZip, setSearchZip] = useState("");
  const [searchCuisine, setSearchCuisine] = useState("");
  const [cuisines, setCuisines] = useState(["All Cuisines"]);
  const [restaurant_ids, setRestaurant_ids] = useState([])

  useEffect(() => {
    retrieveRestaurants();
    retrieveCuisines();
  }, []);

  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onChangeSearchZip = (e) => {
    const searchZip = e.target.value;
    setSearchZip(searchZip);
  };

  const onChangeSearchCuisine = (e) => {
    const searchCuisine = e.target.value;
    setSearchCuisine(searchCuisine);
  };

  const retrieveRestaurants = () => {
    RestaurantDataService.getAll()
      .then((response) => {
        console.log(response.data);
        setRestaurants(response.data.restaurants);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveCuisines = () => {
    RestaurantDataService.getCuisines()
      .then((response) => {
        console.log(response.data);
        setCuisines(["All Cuisines"].concat(response.data));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const refreshList = () => {
    retrieveRestaurants();
  };

  const find = (query, by) => {
    RestaurantDataService.find(query, by)
      .then((response) => {
        console.log(response.data);
        setRestaurants(response.data.restaurants);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const findByName = () => {
    find(searchName, "name");
  };

  const findByZip = () => {
    find(searchZip, "zipcode");
  };

  const findByCuisine = () => {
    if (searchCuisine === "All Cuisines") {
      refreshList();
    } else {
      find(searchCuisine, "cuisine");
    }
  };

  const selectRestaurant = async (restaurant) => {
    let rests = await get_restaurants()
    setRestaurant_ids(rests)
    console.log("ids are: " + restaurant_ids)
    console.log(rests)
    if (rests.includes(restaurant._id)) {
      console.log("restaurants is thee");
    }else{
      await new_restaurant(restaurant.name, restaurant._id);
      console.log("restaurants is not there");
  }
    setRestaurant(restaurant);
  }

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark justify-content-between">
        <a href="/restaurants" className="navbar-brand mx-2">
          Crypt Restaurant Service
        </a>
        <div className="navbar-nav mr-auto"></div>
        <button className="link" style={{ float: "right" }} onClick={logout}>
          Sign out
        </button>
      </nav>
      <div className="row pb-1">
        <div className="input-group col-lg-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name"
            value={searchName}
            onChange={onChangeSearchName}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByName}
            >
              Search
            </button>
          </div>
        </div>
        <div className="input-group col-lg-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by zip"
            value={searchZip}
            onChange={onChangeSearchZip}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByZip}
            >
              Search
            </button>
          </div>
        </div>
        <div className="input-group col-lg-4">
          <select onChange={onChangeSearchCuisine}>
            {cuisines.map((cuisine, index) => {
              return (
                <option value={cuisine} key={index}>
                  {" "}
                  {cuisine.substring(0, 20)}{" "}
                </option>
              );
            })}
          </select>
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByCuisine}
            >
              Search
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        {restaurants.map((restaurant, index) => {
          const address = `${restaurant.address.building} ${restaurant.address.street}, ${restaurant.address.zipcode}`;
          return (
            <div className="col-lg-4 pb-1" key={index}>
              <div
                className="card"
                onClick={() => selectRestaurant(restaurant)}
              >
                <div className="card-body">
                  <h5 className="card-title">{restaurant.name}</h5>
                  <div className="card-text rest-card">
                    <div className="card-info">
                      <strong>Main cuisine: </strong>
                      {restaurant.cuisine}
                      <br />
                      <strong>Address: </strong>
                      {address}
                    </div>
                    <ul className="d-flex justify-content-between">
                      <li className="btn-here btn btn-primary float-start">
                        I'm here
                      </li>
                      <li
                        target="_blank"
                        href={"https://www.google.com/maps/place/" + address}
                        className="btn btn-secondary me-4"
                        rel="noreferrer"
                      >
                        <i className="fas fa-map-marker-alt    "></i>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RestaurantsList;
