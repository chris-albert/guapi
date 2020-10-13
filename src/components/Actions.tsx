import React from "react";
import { Button, Card } from "react-bootstrap";
import { Actions as ActionsType } from "../data/Types"
import * as t from 'io-ts'
import _ from 'lodash'
import { Option, isNone, isSome } from "fp-ts/Option"
import qs from 'qs'
import { useHistory } from "react-router-dom";

type ActionProps = {
  actions : Array<t.TypeOf<typeof ActionsType>> | undefined,
  response: Option<any>
}

const Actions = (props: ActionProps) => {

  const history = useHistory();

  const onClick = (action: t.TypeOf<typeof ActionsType>): void => {
    if(isSome(props.response)) {
      console.log(props.response.value)
      const params = _.get(props.response.value, action.params)
      const query = qs.stringify(params)
      const link = action.path + "?" + query
      console.log("Link to", link)
      history.push(link)
    }
  }

  if(_.isUndefined(props.actions)) {
    return (<span></span>)
  } else {
    return (
      <Card className="mb-3">
        <Card.Header>
          Actions
        </Card.Header>
        <Card.Body>
          {_.map(props.actions, action => {
            return (
              <Button
                disabled={isNone(props.response)}
                size="sm"
                onClick={() => onClick(action)}
              >
                {action.display}
              </Button>
            )
          })}
        </Card.Body>
      </Card>
    )
  }
}

export default Actions