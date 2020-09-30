import React from "react";
import { Interaction } from "../data/Types";
import * as t from 'io-ts'
import { Card, Container, Row, Col } from "react-bootstrap";
import Form from "./Form";
import Request from "./Request";
import Response from "./Response";
import {Option, none} from "fp-ts/Option";
import {Either} from "fp-ts/Either";
import {AxiosResponse} from "axios";

type APIInteractionProps = {
  interaction: t.TypeOf<typeof Interaction>
}

const APIInteraction = (props: APIInteractionProps) => {

  const [request , setRequest]  = React.useState<object>({})
  const [response, setResponse] = React.useState<Option<Either<any, AxiosResponse<any>>>>(none)

  return (
    <Card>
      <Card.Header>{props.interaction.display}</Card.Header>
      <Card.Body>
        <Container fluid>
          <Row>
            <Col>
              <Form
                interaction={props.interaction}
                setRequest={setRequest}
                setResponse={setResponse}
              />
              <Request request={request}/>
            </Col>
            <Col>
              <Response response={response}/>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  )
}

export default APIInteraction