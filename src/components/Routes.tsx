import React from "react";
import {HashRouter, Switch, Route} from 'react-router-dom'
import {Navbar, Nav, Row, Col, Container} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap"
import Config from "./Config";
import ConfigProvider from "../data/ConfigProvider";
import { isRight } from "fp-ts/Either";
import _ from 'lodash'
import ConfigError from "./ConfigError";
import Item from "./Item";

const Routes = () => {

  const config = ConfigProvider.config()

  const configLinks = isRight(config) ?
    _.map(config.right.nav, nav => (
      <LinkContainer key={`nav-link-${nav.name}`} to={`/${nav.name}`}>
        <Nav.Link>{nav.display}</Nav.Link>
      </LinkContainer>
    )) :
    (
      <LinkContainer to={`/error`}>
        <Nav.Link>Error</Nav.Link>
      </LinkContainer>
    )

  const configRoutes = isRight(config) ?
    _.map(config.right.nav, nav => (
      <Route key={`nav-route-${nav.name}`} path={`/${nav.name}`}>
        <Item item={nav} />
      </Route>
    )) :
    (
      <Route path="/error">
        <ConfigError errors={config.left} />
      </Route>
    )

  return (
    <HashRouter>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="#home">GUAPI</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {configLinks}
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <Nav className="mr-auto">
              <LinkContainer to="/config">
                <Nav.Link>Config</Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <Switch>
              <Route path="/config">
                <Config />
              </Route>
              {configRoutes}
            </Switch>
          </Col>
        </Row>
      </Container>
    </HashRouter>
  )
}

export default Routes