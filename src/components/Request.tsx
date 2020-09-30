import React from "react";
import { Card, Accordion } from "react-bootstrap";
import JsonEditor from "./JsonEditor";

type RequestsProps = {
  request: object
}

const Request = (props: RequestsProps) => {
  return (
    <Accordion defaultActiveKey="0" className="mt-3">
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey="0">
          Request
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <JsonEditor
              content={JSON.stringify(props.request, null, 2)}
              readOnly={true}
              onChange={() => null} />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  )
}

export default Request
