import React, { MouseEvent } from "react";
import {Card, Accordion, Badge} from "react-bootstrap";
import JsonEditor from "./JsonEditor";
import * as t from "io-ts";
import {Request as RequestType} from "../data/Types";

type RequestsProps = {
  request    : object,
  requestType: t.TypeOf<typeof RequestType>
}

const Request = (props: RequestsProps) => {

  const [debug, setDebug] = React.useState<boolean>(false)

  const debugClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setDebug(!debug)
  }

  const content = debug ?
    RequestType.encode(props.requestType) :
    props.request

  return (
    <Accordion defaultActiveKey="0" className="mt-3">
      <Card>
        <Accordion.Toggle className="pointer" as={Card.Header} eventKey="0">
          Request
          <Badge
            className="float-right mt-1"
            variant="dark"
            onClick={debugClick}
          >
            Show {debug ? "Request" : "Config"}
          </Badge>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <JsonEditor
              content={JSON.stringify(content, null, 2)}
              readOnly={true}
              onChange={() => null} />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  )
}

export default Request
