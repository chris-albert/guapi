import React from "react";
import { FormItem } from "../data/Types";
import * as t from 'io-ts'
import { Container, Row, Col } from "react-bootstrap";
import Form from "./Form";
import Request from "./Request";
import Response from "./Response";
import {Option, none, some, isSome } from "fp-ts/Option";
import {Either, right, left} from "fp-ts/Either";
import _ from "lodash";
import axios, { AxiosResponse } from 'axios'
import Template from "../util/Template";
import { useLocation } from 'react-router-dom'
import qs from 'qs'

type APIInteractionProps = {
  settings: object,
  form    : t.TypeOf<typeof FormItem>
}

const APIInteraction = (props: APIInteractionProps) => {

  const params = qs.parse(useLocation().search.replace("?",""))

  const [request , setRequest]  = React.useState<object>({})
  const [response, setResponse] = React.useState<Option<Either<any, AxiosResponse<any>>>>(none)
  const [loading , setLoading]  = React.useState<boolean>(false)
  const [fields  , setFields]   = React.useState<object>(() => {
    const f = _.fromPairs(_.map(props.form.form.request.fields, field => {
      return [field.name, field.value]
    }))
    return _.extend(f, params)
  })

  React.useEffect(() => {
    onFieldChange(fields)
  }, [])

  const onFieldChange = (obj: object) => {
    const root = typeof props.form.form.request.root === "string" ?
      _.set({}, props.form.form.request.root, obj) :
      fields
    setFields(obj)
    setRequest(buildRequest(root, _.extend(_.clone(obj), props.settings)))
  }

  const fieldChange = (key: string, value: any): void => {
    onFieldChange(_.set(fields, key, value))
  }

  const onSubmit = () => {
    setLoading(true)
    axios(request)
      .then(res => {
        setResponse(some(right(res)))
        setLoading(false)
      })
      .catch(err => {
        setResponse(some(left(err)))
        setLoading(false)
      })
  }

  const buildRequest = (fields: object, all: object): object => {
    return {
      method: _.toUpper(props.form.form.request.method),
      url   : Template.replace(props.form.form.request.url, all) + Template.replace(props.form.form.request.path, all),
      params: fields
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