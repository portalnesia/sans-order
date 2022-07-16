import XenditClass from 'xendit-node'
import axios from 'axios'
import type {AxiosRequestConfig, AxiosResponse} from 'axios'

export const xenditSecretKey = process.env.XENDIT_SECRETKEY as string;
export const xenditDevSecretKey = process.env.XENDIT_DEV_SECRETKEY as string; 

const xenditInstance = new XenditClass({
  secretKey:xenditSecretKey,
})


const base64SecretKey = Buffer.from(`${xenditSecretKey}:`).toString('base64')

export const axiosOptions = {
  headers:{
    'Authorization':`Basic ${base64SecretKey}`,
    'Accept':'application/json'
  }
}

async function getXendit<D=any>(url: string) {
  return axios.get<D>(url,axiosOptions);
}

async function postXendit<D=any,B=any>(url: string,data: B) {
  return axios.post<D,AxiosResponse<D>,B>(url,data,axiosOptions);
}

class Xendit {
  xendit=xenditInstance

  get<D=any>(url: string) {
    return getXendit<D>(url);
  }
  post<D=any,B=any>(url: string,data: B) {
    return postXendit<D,B>(url,data)
  }
}

const xendit = new Xendit();
export default xendit;