import {useCallback,useState,useEffect,useRef} from 'react'

type MouseTrapKeySequence = string | Array<string>;
type RefObject=(event?: KeyboardEvent)=>void
export const useMousetrap=(handlerKey: MouseTrapKeySequence, handlerCallback: (event?: KeyboardEvent)=>void,global: boolean=false) => {
  let actionRef= useRef<RefObject|null>(null);

  useEffect(() => {
    const mousetrap=require('mousetrap')
    if(global) {
      require('mousetrap/plugins/global-bind/mousetrap-global-bind')
      mousetrap.bindGlobal(handlerKey, (evt: KeyboardEvent) => {
        typeof handlerCallback === 'function' && handlerCallback(evt);
      });
    } else {
      mousetrap.bind(handlerKey, (evt: KeyboardEvent) => {
        typeof handlerCallback === 'function' && handlerCallback(evt);
      });
    }
    return () => {
      mousetrap.unbind(handlerKey);
    };
  }, [handlerKey,handlerCallback]);
  
  return null
};