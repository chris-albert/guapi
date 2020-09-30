import React from "react";
import { Card } from "react-bootstrap";
import JsonEditor from "./JsonEditor";

type RequestsProps = {
  request: object
}

const Request = (props: RequestsProps) => {
  return (
    <Card>
      <Card.Header>Request</Card.Header>
      <Card.Body>
        <JsonEditor
          content={JSON.stringify(props.request, null, 2)}
          readOnly={true}
          onChange={() => null} />
      </Card.Body>
    </Card>
  )
}

export default Request
