import React from "react";
import { Card, Alert } from "react-bootstrap";
import _ from 'lodash'

type ConfigErrorProps = {
  errors: Array<string>
}

const ConfigError = (props: ConfigErrorProps) => {
  return (
    <Card>
      <Card.Header>Config Errors</Card.Header>
      <Card.Body className="p-0">
        {_.map(props.errors, error => (
          <Alert key={error} variant="danger">{error}</Alert>
        ))}
      </Card.Body>
    </Card>
  )
}

export default ConfigError