import React from "react";
import { Interaction } from "../data/Types"
import * as t from 'io-ts'
import { Card, Form as ReactForm, Button } from "react-bootstrap";
import _ from "lodash";
import FormField from "./FormField";
import Template from '../util/Template'
import axios, { AxiosResponse } from 'axios'
import {Either, left, right} from "fp-ts/Either";
import {Option, some} from 'fp-ts/Option'

type FormProps = {
  interaction: t.TypeOf<typeof Interaction>,
  setRequest : (request: object) => void,
  setResponse: (res: Option<Either<any, AxiosResponse<any>>>) => void
}

const Form = (props: FormProps) => {

  const [fields, setFields] = React.useState<object>(
    _.fromPairs(_.map(props.interaction.fields, field => {
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
    axios(buildRequest())
      .then(res => {
        props.setResponse(some(right(res)))
      })
      .catch(err => {
        props.setResponse(some(left(err)))
      })
  }

  const buildRequest = (): object => {
    return {
      method: _.toUpper(props.interaction.method),
      url   : Template.replace(props.interaction.url, fields) + Template.replace(props.interaction.path, fields),
      params: fields
    }
  }

  return (
    <Card>
      <Card.Header>Form</Card.Header>
      <Card.Body>
        <ReactForm>
          {_.map(props.interaction.fields, field => (
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
          onClick={onSubmit}
        >
          Submit
        </Button>
      </Card.Footer>
    </Card>
  )
}

export default Form