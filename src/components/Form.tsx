import React from "react";
import { FormItem } from "../data/Types"
import * as t from 'io-ts'
import { Card, Form as ReactForm, Button, Spinner } from "react-bootstrap";
import _ from "lodash";
import FormField from "./FormField";
import Template from '../util/Template'
import axios, { AxiosResponse } from 'axios'
import {Either, left, right} from "fp-ts/Either";
import {Option, some} from 'fp-ts/Option'

type FormProps = {
  form       : t.TypeOf<typeof FormItem>,
  setRequest : (request: object) => void,
  setResponse: (res: Option<Either<any, AxiosResponse<any>>>) => void,
  loading    : boolean,
  setLoading : (loading: boolean) => void
}

const Form = (props: FormProps) => {

  const [fields, setFields] = React.useState<object>(
    _.fromPairs(_.map(props.form.form.request.fields, field => {
      return [field.name, field.value]
    }))
  )

  React.useEffect(() => {
    props.setRequest(buildRequest())
  }, [])

  const formChange = (key: string, value: any): void => {
    setFields(_.set(fields, key, value))
    props.setRequest(buildRequest())
  }

  const onSubmit = () => {
    props.setLoading(true)
    axios(buildRequest())
      .then(res => {
        props.setResponse(some(right(res)))
        props.setLoading(false)
      })
      .catch(err => {
        props.setResponse(some(left(err)))
        props.setLoading(false)
      })
  }

  const buildRequest = (): object => {
    return {
      method: _.toUpper(props.form.form.request.method),
      url   : Template.replace(props.form.form.request.url, fields) + Template.replace(props.form.form.request.path, fields),
      params: fields
    }
  }

  return (
    <Card>
      <Card.Header>Form</Card.Header>
      <Card.Body>
        <ReactForm>
          {_.map(props.form.form.request.fields, field => (
            <FormField key={`form-field-${field.name}`} field={field} onChange={formChange}/>
          ))}

        </ReactForm>
      </Card.Body>
      <Card.Footer>
        <Button
          className="pull-right"
          variant="primary"
          type="submit"
          size="sm"
          disabled={props.loading}
          onClick={() => props.loading ? null : onSubmit()}
        >
          {props.loading ?
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            /> :
            <span>Submit</span>
          }

        </Button>
      </Card.Footer>
    </Card>
  )
}

export default Form