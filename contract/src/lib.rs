use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, log, near_bindgen};
use std::collections::HashMap;

mod info;

/*
    This is a restaurant service contract where clients can get to a restaurant and get the restaurant's
    near account. With it, they can check the menu, make food orders, add ratings and also pay for their food items.
    This can all be done securely and anoymously.
*/

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    restaurants: HashMap<String, Restaurant>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Restaurant {
    name: String,
    menu: HashMap<String, f32>,
    table_allocation: HashMap<u8, Client>,
    // all_ratings stores all ratings made by clients and the avg_rating stored the final computed average rating
    all_ratings: Vec<u8>,
    avg_rating: f32,
}

/*
    This is all the clients information we'll be storing per table in the contract.table_allocation,
    that is the food the client requested, the table and also the cost of the food in NEAR
*/
#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize, Clone)]
pub struct Client {
    table: u8,
    food: Vec<String>,
    cost: f32,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            restaurants: HashMap::new(),
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn new_restaurant(&mut self, name: String, id: String) {
        if self.restaurants.contains_key(&id) {
            return;
        }
        let new_rest = Restaurant {
            name,
            menu: info::menu_items(),
            table_allocation: HashMap::new(),
            all_ratings: Vec::new(),
            avg_rating: 5.0,
        };

        self.restaurants.insert(id, new_rest);
    }
    pub fn get_restaurants(&self) -> Vec<&String> {
        let mut ids = vec![];
        for id in &self.restaurants {
            ids.push(id.0)
        }
        ids
    }
    
    pub fn menu(&self) {
        info::menu();
    }

    pub fn menu_items(&self, id: String) -> Vec<(String, f32)> {
        let mut menus: Vec<(String, f32)> = vec![];
        for menu in self.restaurants[&id].menu.clone() {
            menus.push(menu);
        }
        menus
    }
    /*
        The order function which the client calls to make an meal order. The client passes his food choice and table number.
        The data provided is used to initialized a new instance of a client object only if the food provided exists in the MENU_ITEMS.
    */
    pub fn order(&mut self, id: String, table_number: u8, food_choice: Vec<String>) {
        log!(
            "Table number {} your order is {:?} ",
            &table_number,
            &food_choice
        );
        // Check if the client's food exists in the MENU_ITEMS
        env::log_str("Your order is confirmed");
        // // Get the index of the food from the MENU_ITEMS so as to match the order's price
        // let food_index: usize = MENU_ITEMS.iter().position(|&x| x == &food_choice).unwrap();
        // The cost is currently in dollars thus divided by the current value of NEAR to convert it to near
        let mut cost: f32 = 0.0;
        for food in food_choice.clone() {
            cost += self.restaurants[&id].menu[&food];
        } // 5.64
        let client_new = Client {
            table: table_number,
            food: food_choice,
            cost: cost,
        };
        // call the add_client method passing the generated Client and the table_number as key
        self.add_client(id.clone(), client_new.clone(), table_number);
        log!(
            "Your food should cost: {} near",
            self.restaurants[&id].table_allocation[&table_number].cost
        );
        
    }

    // non public function to add the newly generated client to the table_allocation hashmap
    #[result_serializer(borsh)]
    fn add_client(&mut self, id: String, client: Client, table: u8) {
        if let Some(table_allocation) = self.restaurants.get_mut(&id) {
            table_allocation.table_allocation.insert(table, client);
        }
    }
    // Called to get the reciept for the cost of meals per table_number
    pub fn reciept(&self, id: String, table_number: u8) -> f32 {
        log!(
            "You will be charged {} near",
            self.restaurants[&id].table_allocation[&table_number].cost
        );
        self.restaurants[&id].table_allocation[&table_number].cost
    }

    // A payable function where clients can pay for their meals using NEAR tokens
    #[payable]
    pub fn pay(&mut self, id: String, table_number: u8) -> String {
        // Assign attached near and the cost of food for the table to variables
        let tokens = env::attached_deposit();
        let charge = self.restaurants[&id].table_allocation[&table_number].cost;
        log!("deposited {} ", tokens);
        // convert unsigned integer to float and yocto to near
        let token_near = to_near(tokens);
        log!("cost: {}, token near {}", charge, token_near);
        // if checks to compare the token recieved to the expected charge for the meals
        if token_near <= 0.00002 {
            return "unsuccessful".to_string();
        }
        if token_near - charge > 0.00002 {
            log!(
                "You paid more by {} we hope it's a tip",
                (token_near - charge)
            );
            return "paid more".to_string();
        }
        if charge - token_near > 0.00002 {
            log!(
                "You paid less by {} please consider paying up",
                (charge - token_near)
            );
            return "paid less".to_string();
        } else {
            return "successful".to_string();
        }
    }
    // Manage client ratings and Restaurant avarage ratings
    pub fn ratings(&mut self, id: String, rating: u8, table_number: u8) {
        // Check if the table number making the request is a valid client
        if !self.restaurants[&id]
            .table_allocation
            .contains_key(&table_number)
        {
            log!("sorry only clients can rate our services");
            return;
        }
        // Add clients ratings to the all ratings vector
        // self.restaurants[&id].all_ratings.push(rating);
        if let Some(all_ratings) = self.restaurants.get_mut(&id) {
            all_ratings.all_ratings.push(rating);
        }
        // Compute the average ratings of the restaurant
        let ratings_count = self.restaurants[&id].all_ratings.len() as f32;
        // Get a sum of total ratings inclusive of the newly added rating using a for loop
        let mut total_ratings = 0.0;

        for rate in &self.restaurants[&id].all_ratings {
            total_ratings += *rate as f32;
        }
        // Compute a new average rating and Update it to the Restaurant struct
        if let Some(avg_rating) = self.restaurants.get_mut(&id) {
            avg_rating.avg_rating = total_ratings / ratings_count;
        }
        log!(
            "Current restaurant ratings stand at {}",
            self.restaurants[&id].avg_rating
        )
    }

    // #[result_serializer(borsh)]
    pub fn get_greeting(&self) -> String {
        return "tftftrcdtdx".to_string();
    }

    // #[result_serializer(borsh)]
    pub fn set_greeting(&mut self, message: String) {
        // Use env::log to record logs permanently to the blockchain!
        log!("Saving greeting {}", message);
    }
}

fn to_near(yocto: u128) -> f32 {
    (yocto as f32) / 1_000_000_000_000_000_000_000_000.0
}

/*
 * the rest of this file sets up unit tests
 * to run these, the command will be:
 * cargo test --package rust-template -- --nocapture
 * Note: 'rust-template' comes from Cargo.toml's 'name' key
 */

// use the attribute below for unit tests
#[cfg(test)]
mod tests {
    // use super::*;
    // use near_sdk::{testing_env, VMContext};

    // fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
    //     VMContext {
    //         current_account_id: "restaurants.collinsrutto.testnet".to_string(),
    //         signer_account_id: "bob_near".to_string(),
    //         signer_account_pk: vec![0, 1, 2],
    //         predecessor_account_id: "collinsrutto.testnet".to_string(),
    //         input,
    //         block_index: 0,
    //         block_timestamp: 0,
    //         account_balance: 0,
    //         account_locked_balance: 0,
    //         storage_usage: 0,
    //         attached_deposit: 0,
    //         prepaid_gas: 10u64.pow(18),
    //         random_seed: vec![0, 1, 2],
    //         is_view,
    //         output_data_receivers: vec![],
    //         epoch_height: 19,
    //     }
    // }

    // #[test]
    // fn create_user() {
    //     let mut contract: Contract = Contract::default();
    //     contract.order(2, "Prawns".to_string()); // used uppercase to test if its converted to lowercase
    //     contract.order(4, "Fried egg".to_string());
    //     assert_eq!(2, contract.table_allocation.len());
    //     assert_eq!("prawns".to_string(), contract.table_allocation[&2].food); // assert right food is served
    //     let prawns_cost = 5.0; // price of prawns read directly from the MENU_PRICES array
    //     assert_eq!(prawns_cost, contract.table_allocation[&2].cost); // check if price is correct for the food ordered
    // }

    // #[test]
    // #[should_panic]
    // fn add_ratings_without_table() {
    //     let mut contract: Contract = Contract::default();
    //     contract.ratings(2, 3); // 2 is client rating and 3 is table number
    //     assert!(5.0 > contract.avg_rating); // average rating should be lower if the rating is added
    // }

    // #[test]
    // fn add_ratings() {
    //     let mut contract: Contract = Contract::default();
    //     contract.order(2, "Prawns".to_string());
    //     assert_eq!(5.0, contract.avg_rating);
    //     contract.ratings(4, 2); // 4 is client rating and 2 is table number
    //     assert!(5.0 > contract.avg_rating); // average rating should be lower
    // }

    // #[test]
    // fn pay_expected_amount() {
    //     let mut context = get_context(vec![], false);
    //     context.attached_deposit = 3000000000000000000000000; // attaching 3 NEAR
    //     context.is_view = false;
    //     testing_env!(context);

    //     let mut contract: Contract = Contract::default();
    //     contract.order(5, "Fried egg".to_string());
    //     let response = contract.pay(5);
    //     assert_eq!("successful".to_string(), response)
    // }

    // #[test]
    // fn pay_more_amount() {
    //     let mut context = get_context(vec![], false);
    //     context.attached_deposit = 4000000000000000000000000; // attached 4 NEAR
    //     context.is_view = false;
    //     testing_env!(context);

    //     let mut contract: Contract = Contract::default();
    //     contract.order(5, "Fried egg".to_string());
    //     let response = contract.pay(5);
    //     assert_eq!("paid more".to_string(), response)
    // }

    // #[test]
    // fn pay_no_amount() {
    //     let mut context = get_context(vec![], false);
    //     context.attached_deposit = 0000000000000000000000000; // attached 0 NEAR
    //     context.is_view = false;
    //     testing_env!(context);

    //     let mut contract: Contract = Contract::default();
    //     contract.order(5, "Fried egg".to_string());
    //     let response = contract.pay(5);
    //     assert_eq!("unsuccessful".to_string(), response)
    // }
    // #[test]
    // fn test_hash_map() {
    //     let contract: Contract = Contract::default();
    //     let bools = contract.menu.contains_key(&"prawns".to_string());
    //     log!("{}", bools);
    //     assert_eq!(true, bools)
    // }
}
