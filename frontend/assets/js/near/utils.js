import { connect, Contract, keyStores, WalletConnection } from 'near-api-js'
import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [
        "get_restaurants",
        "get_greeting",
        "menu",
        "reciept",
        "menu_items",
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
        "new_restaurant",
        "set_greeting",
        "hello",
        "order",
        "pay",
        "ratings",
      ],
    }
  );
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

export async function set_greeting(message){
  let response = await window.contract.set_greeting({
    args:{message: message}
  })
  return response
}

export async function get_greeting(){
  let greeting = await window.contract.get_greeting()
  return greeting
}

export async function get_restaurants(){
  let restaurant_ids = await window.contract.get_restaurants()
  return restaurant_ids
}

export async function new_restaurant(name, id){
  await window.contract.new_restaurant({
    args:{name: name, id: id}
  })
}

export async function hello(id) {
  await window.contract.hello({
    args: { id: id }
  });
}

export async function menu(id) {
  let response = await window.contract.menu({
    id: id
  });
  return response
}

export async function menu_items(id) {
  let menus = await window.contract.menu_items({
      id: id
  })
  return menus
}

export async function order(id, table, foods) {
  await window.contract.order({
    id: id, table_number: table, food_choice: foods
  })
}

export async function reciept(id, table) {
  console.log("id: " + id, "table_number: " + table)
  let cost = await window.contract.reciept({
    id: id, table_number: table
  })
  return cost
}

export async function pay(id, table, cost) {
  let status = await window.contract.pay({
    id: id, table_number: table },
    "300000000000000",
    (cost*10000+"00000000000000000000").toString(),
  );
  return status
}