import * as t from 'io-ts'
import { Either, left, right, isRight } from "fp-ts/Either";
import { StorageKey } from "../util/Storage";
import { Config } from "./Types"
import _ from 'lodash'

const storage = StorageKey("config")

const ConfigProvider = {
  config: (): Either<Array<string>, t.TypeOf<typeof Config>> => {
    const res = storage.get()
    if(_.isNull(res)) {
     return left(["Empty config"])
    } else {
      const config = Config.decode(JSON.parse(res))
      if (isRight(config)) {
        return right(config.right)
      } else {
        console.error(config)
        const errors = _.map(config.left, error => {
          return _.join(_.map(error.context, c => c.key), '.')
        })
        return left(errors)
      }
    }
  }
}

export default ConfigProvider