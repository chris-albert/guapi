import { StorageKey } from "../util/Storage";
import _ from 'lodash'

const storage = StorageKey("settings")

const SettingsRepository = {
  get: ():  object => {
    const res = storage.get()
    const settings = _.isNull(res) ? {} : JSON.parse(res)
    if(_.isObject(settings)) {
      return settings
    } else {
      return {}
    }
  },
  set: (key: string, val: any): void => {
    const o = _.set(SettingsRepository.get(), key, val)
    storage.save(JSON.stringify(o))
  }
}

export default SettingsRepository