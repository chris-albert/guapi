import React from "react";
import { FormItem } from "../data/Types";
import * as t from 'io-ts'
import { Container, Row, Col } from "react-bootstrap";
import Form from "./Form";
import Request from "./Request";
import Response from "./Response";
import {Option, none, some} from "fp-ts/Option";
import {Either, right, left} from "fp-ts/Either";
import _ from "lodash";
import axios, { AxiosResponse } from 'axios'
import Template from "../util/Template";

type APIInteractionProps = {
  form: t.TypeOf<typeof FormItem>
}

const APIInteraction = (props: APIInteractionProps) => {

  const [request , setRequest]  = React.useState<object>({})
  const [response, setResponse] = React.useState<Option<Either<any, AxiosResponse<any>>>>(none)
  const [loading , setLoading]  = React.useState<boolean>(false)
  const [fields  , setFields]   = React.useState<object>(() => {
    return _.fromPairs(_.map(props.form.form.request.fields, field => {
      return [field.name, field.value]
    }))
  })

  React.useEffect(() => {
    onFieldChange(fields)
  }, [])

  const onFieldChange = (obj: object) => {
    console.debug("onFieldChange", obj)
    setFields(obj)
    setRequest(buildRequest(obj))
  }

  const fieldChange = (key: string, value: any): void => {
    onFieldChange(_.set(fields, key, value))
  }

  const onSubmit = () => {
    setLoading(true)
    axios(buildRequest(fields))
      .then(res => {
        setResponse(some(right(res)))
        setLoading(false)
      })
      .catch(err => {
        setResponse(some(left(err)))
        setLoading(false)
      })
  }

  const buildRequest = (f: Object): object => {
    return {
      method: _.toUpper(props.form.form.request.method),
      url   : Template.replace(props.form.form.request.url, f) + Template.replace(props.form.form.request.path, f),
      params: f
    }
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          <Form
            form={props.form}
            fields={fields}
            fieldChanged={fieldChange}
            loading={loading}
            onSubmit={onSubmit}
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
  )
}

export default APIInteraction