import React from "react";
import { Card } from "react-bootstrap";
import JsonEditor from "./JsonEditor";
import {Option} from "fp-ts/Option";
import {Either} from "fp-ts/Either";
import {AxiosResponse} from "axios";

type ResponseProps = {
  response: Option<Either<any, AxiosResponse<any>>>
}

const Response = (props: ResponseProps) => {
  return (
    <Card>
      <Card.Header>Response</Card.Header>
      <Card.Body>
        <JsonEditor
          content={JSON.stringify(props.response, null, 2)}
          readOnly={true}
          onChange={() => null} />
      </Card.Body>
    </Card>
  )
}

export default Response
