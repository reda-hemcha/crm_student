import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import studentsReducer from './studentsSlice'
import schoolsReducer from './schoolsSlice'
import adminsReducer from './adminsSlice'
import classesReducer from './classesSlice'
import whatsappReducer from './whatsappSlice'
import dashboardReducer from './dashboardSlice'
import broadcastReducer from './broadcastSlice'
import oneToOneReducer from './oneToOneSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentsReducer,
    schools: schoolsReducer,
    admins: adminsReducer,
    classes: classesReducer,
    whatsapp: whatsappReducer,
    dashboard: dashboardReducer,
    broadcasts: broadcastReducer,
    oneToOne: oneToOneReducer,
  },
})

export default store