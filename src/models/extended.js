import store from 'store'
import { app_config } from 'config'
import keys from 'config/app_keys'
import { user, session } from 'core/helpers'
import { router, verbosity, appInterface } from 'core/libs'
import settings from 'core/libs/settings'
import { uri_resolver } from 'api/lib'
import { DynamicSDCP } from 'core/libs/extension'

import jwt from 'jsonwebtoken'
import cookie from 'cookie_js'


export default {
  namespace: 'extended',
  state: {
    sidebar: null,
    contextMenu: null,
    core: null
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'query' });
    },
  },
  effects: {
    *query({ payload }, { call, put, select }) {
    
    }
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
