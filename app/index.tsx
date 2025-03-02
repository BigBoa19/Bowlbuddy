import React from "react"
import { UserContext } from './context';
import { Redirect } from "expo-router"
import SignIn from "./(auth)/sign-in"

export default function Index() {
  const { user } = React.useContext(UserContext);

  
  return user ? <Redirect  href='/play'/> : <SignIn />;
}
