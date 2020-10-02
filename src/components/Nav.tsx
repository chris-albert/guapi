import React from "react";
import { NavItem } from "../data/Types"
import * as t from 'io-ts'
import _ from "lodash"

interface NavProps {
  nav: t.TypeOf<typeof NavItem>
}

const Nav = (props: NavProps) => {
  return (
    <div>
      {_.map(props.nav.nav, nav => {
        return (
          <div>{nav.display}</div>
        )
      })}
    </div>
  )
}

export default Nav