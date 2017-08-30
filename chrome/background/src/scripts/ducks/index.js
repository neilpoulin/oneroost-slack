import { combineReducers } from "redux"
import thread from "./thread"
import user from "./user"
import brandPages from "./brandPages"
import gmail from "./gmail"

const reducers = combineReducers({
    brandPages,
    gmail,
    thread,
    user,
})

export default reducers
