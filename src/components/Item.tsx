import React from "react";
import {FormItem, Item as ItemType} from "../data/Types"
import * as t from 'io-ts'
import APIInteraction from "./APIInteraction";
import Nav from "./Nav";

interface ItemProps {
  item: t.TypeOf<typeof ItemType>
}

const Item = (props: ItemProps) => {

  if('form' in props.item) {
    return (
      <APIInteraction form={props.item} />
    )
  } else {
    return (
      <Nav nav={props.item} />
    )
  }
}

export default Item