import React from "react";
import { FormItem } from "../data/Types";
import * as t from 'io-ts'
import { Card, Container, Row, Col } from "react-bootstrap";
import Form from "./Form";
import Request from "./Request";
import Response from "./Response";
import {Option, none} from "fp-ts/Option";
import {Either} from "fp-ts/Either";
import {AxiosResponse} from "axios";

type APIInteractionProps = {
  form: t.TypeOf<typeof FormItem>
}

const APIInteraction = (props: APIInteractionProps) => {

  const [request , setRequest]  = React.useState<object>({})
  const [response, setResponse] = React.useState<Option<Either<any, AxiosResponse<any>>>>(none)
  const [loading , setLoading]  = React.useState<boolean>(false)

  return (
    <Card>
      <Card.Header>{props.form.display}</Card.Header>
      <Card.Body>
        <Container fluid>
          <Row>
            <Col>
              <Form
                form={props.form}
                setRequest={setRequest}
                setResponse={setResponse}
                loading={loading}
                setLoading={setLoading}
              />
              <Request
                request={request}
                requestType={props.form.form.request}
              />
            </Col>
            <Col>
              <Response
                response={response}
                loading={loading}
              />
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  )
}

export default APIInteraction