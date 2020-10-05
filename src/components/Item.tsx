import React from "react";
import { Item as ItemType } from "../data/Types"
import * as t from 'io-ts'
import APIInteraction from "./APIInteraction";
import Nav from "./Nav";

interface ItemProps {
  settings: object,
  item    : t.TypeOf<typeof ItemType>
}

const Item = (props: ItemProps) => {

  if('form' in props.item) {
    return (
      <APIInteraction settings={props.settings} form={props.item} />
    )
  } else {
    return (
      <Nav settings={props.settings} nav={props.item} />
    )
  }
}

export default Item