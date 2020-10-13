import React from "react";
import { FormItem, Field, FieldFunctions } from "../data/Types";
import * as t from 'io-ts'
import { Container, Row, Col } from "react-bootstrap";
import Form from "./Form";
import Request from "./Request";
import Response from "./Response";
import Actions from "./Actions"
import {Option, none, some, isSome } from "fp-ts/Option";
import {Either, right, left, isRight } from "fp-ts/Either";
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

  const initialFields = _.fromPairs(_.map(props.form.form.request.fields, field => {
    const i = _.get(params, field.name)
    if(!_.isUndefined(i)) {
      return [field.name, FieldFunctions.setValue(field, i)]
    } else {
      return [field.name, field]
    }
  }))

  type FieldT = t.TypeOf<typeof Field>
  type Fields = Record<string, FieldT>

  const buildRequest = (fields: object, all: object): object => {
    return {
      method: _.toUpper(props.form.form.request.method),
      url   : Template.replace(props.form.form.request.url, all) + Template.replace(props.form.form.request.path, all),
      params: fields
    }
  }

  const paramsFromFields = (fields: Array<FieldT>): object => {
    return _.fromPairs(_.map(fields, field => {
      return [_.clone(field.name), _.clone(field.value)]
    }))
  }

  const fieldsChange = (obj: object) => {
    const root = typeof props.form.form.request.root === "string" ?
      _.set({}, props.form.form.request.root, obj) :
      obj
    setRequest(buildRequest(root, _.extend(_.clone(obj), props.settings)))
  }

  type ActionType = {
    key           : string,
    updateFunction: (field: FieldT) => FieldT
  }

  const fieldsReducer = (state: Fields, action: ActionType): Fields => {
    const key = action.key
    const field: t.TypeOf<typeof Field> = _.get(state, key)
    const updatedField = action.updateFunction(field)
    const u = _.set(_.cloneDeep(state), key, updatedField)
    fieldsChange(paramsFromFields(_.values(u)))
    return u
  }

  const [fieldsState, fieldsDispatch] = React.useReducer(fieldsReducer, initialFields)

  React.useEffect(() => {
    fieldsChange(paramsFromFields(_.values(initialFields)))
  }, [])

  const fieldChange = (key: string, value: any): void => {
    fieldsDispatch({
      key,
      updateFunction: (field: FieldT): FieldT => {
        return FieldFunctions.setValue(field, value)
      }
    })
  }

  const onGenerate = (key: string): void => {
    console.log('onGenerate', key)
    fieldsDispatch({
      key,
      updateFunction: (field: FieldT): FieldT => {
        return FieldFunctions.generate(field)
      }
    })
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

  const actionResponse: Option<any> = (() => {
    if(isSome(response) && isRight(response.value)) {
      return some(response.value.right.data)
    } else {
      return none
    }
  })()

  return (
    <Container fluid>
      <Row>
        <Col>
          <Form
            form={props.form}
            fields={fieldsState}
            fieldChanged={fieldChange}
            loading={loading}
            onSubmit={onSubmit}
            onGenerate={onGenerate}
          />
          <Request
            request={request}
            requestType={props.form.form.request}
          />
        </Col>
        <Col>
          <Actions
            actions={props.form.form.actions}
            response={actionResponse}
          />
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