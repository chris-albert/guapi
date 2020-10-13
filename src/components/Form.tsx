import React from "react";
import { FormItem, Field } from "../data/Types"
import * as t from 'io-ts'
import { Card, Form as ReactForm, Button, Spinner } from "react-bootstrap";
import _ from "lodash";
import FormField from "./FormField";
import {Shuffle} from "react-bootstrap-icons";

type FormProps = {
  form        : t.TypeOf<typeof FormItem>,
  fields      : Record<string, t.TypeOf<typeof Field>>,
  fieldChanged: (key: string, value: any) => void,
  onSubmit    : () => void,
  loading     : boolean,
  onGenerate  : (key: string) => void
}

const Form = (props: FormProps) => {

  const onGenerate = () => {
    _.forEach(props.fields, field => {
      props.onGenerate(field.name)
    })
  }

  return (
    <Card>
      <Card.Header>
        Form
      </Card.Header>
      <Card.Body>
        <ReactForm>
          {_.map(props.fields, field => (
            <FormField
              key={`form-field-${field.name}`}
              field={field}
              onChange={props.fieldChanged}
              onGenerate={() => props.onGenerate(field.name)}
            />
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
          onClick={() => props.loading ? null : props.onSubmit()}
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
        <Button
          className="float-right"
          size="sm"
          variant="secondary"
          onClick={onGenerate}><Shuffle/></Button>
      </Card.Footer>
    </Card>
  )
}

export default Form