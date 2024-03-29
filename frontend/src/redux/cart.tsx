import {createContext,Dispatch, useCallback, useEffect, useState,ReactNode} from 'react'
import {CopyPartial, TransactionItem, Without} from '@type/index'
import { useRouter } from 'next/router'
import LocalStorage from '@utils/local-storage'
import {logEvent,getAnalytics} from '@utils/firebase'

export type Items = CopyPartial<
  Without<
    TransactionItem,'qty'|'hpp'|'done'|'id'|'metadata'
  >,'notes'|'datetime'|'transaction'|'outlet'
>

export type ICard = CopyPartial<
  Without<
    TransactionItem,'done'|'id'|'metadata'
  >,'notes'|'datetime'|'transaction'|'outlet'
>

export type ContextType = {
  cart: ICard[],
  addQty(item: Items): void,
  manualQty(item: Items,qty: number,notes?: string): void,
  removeQty(item: Items): void,
  removeCart(): void
}

const defaultValue = {
  cart:[],
  addQty:()=>{},
  manualQty:()=>{},
  removeQty:()=>{},
  removeCart:()=>{}
}

export const Context = createContext<ContextType>(defaultValue);

export default function Cart({children}: {children: ReactNode}) {
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;

  const [cart,setCart] = useState<ICard[]>([]);

  useEffect(()=>{
    function checkStorage() {
      const cart = LocalStorage.get<ICard[]>(`cart_${toko_id}_${outlet_id}`);
      if(cart) {
        setCart(cart);
      }
    }
    checkStorage();
  },[toko_id,outlet_id])

  const manualQty = useCallback((item: Items,qty: number,notes?:string)=>{
    const analytics = getAnalytics();
    const index = cart.findIndex(c=>c.item.id === item.item.id);
    let newCart: ICard[];
    if(index > -1) {
      newCart = [...cart];
      if(qty > 0) {
        newCart[index].qty = qty;
        newCart[index].notes = notes && notes?.length > 0 ? notes : undefined;
      } else {
        logEvent(analytics,'remove_from_cart',{
          currency:"IDR",
          value: item.price-item.discount,
          items:[{
            item_id: `${item.item.id}`,
            item_name: item.item.name,
            discount: item.discount,
            price: item.price,
            quantity: qty
          }]
        })
        newCart.splice(index,1);
      }
    } else {
      logEvent(analytics,'add_to_cart',{
        currency:"IDR",
        value: item.price-item.discount,
        items:[{
          item_id: `${item.item.id}`,
          item_name: item.item.name,
          discount: item.discount,
          price: item.price,
          quantity: qty
        }]
      })
      newCart = cart.concat({...item,hpp:item.item.hpp||0,qty,...(notes && notes?.length > 0 ? {notes} : {})});
    }
    setCart(newCart);
    LocalStorage.set(`cart_${toko_id}_${outlet_id}`,newCart);
  },[cart,toko_id,outlet_id])

  const addQty = useCallback((item: Items)=>{
    const index = cart.findIndex(c=>c.item.id === item.item.id);
    let newCart: ICard[];
    if(index > -1) {
      newCart = [...cart];
      const qty = newCart[index].qty
      newCart[index].qty = qty+1;
    } else {
      newCart = cart.concat({...item,hpp:item.item.hpp||0,qty:1});
    }
    setCart(newCart);
    LocalStorage.set(`cart_${toko_id}_${outlet_id}`,newCart);
  },[cart,toko_id,outlet_id])

  const removeQty = useCallback((item:Items)=>{
    const index = cart.findIndex(c=>c.item.id === item.item.id);
    if(index > -1) {
      const newCart = [...cart];
      const qty = newCart[index].qty;
      if(qty >= 2) {
        newCart[index].qty = qty-1;
      } else {
        newCart.splice(index,1);
      }
      setCart(newCart)
      LocalStorage.set(`cart_${toko_id}_${outlet_id}`,newCart);
    }
  },[cart,toko_id,outlet_id])

  const removeCart = useCallback(()=>{
    setCart([]);
    LocalStorage.remove(`cart_${toko_id}_${outlet_id}`);
  },[toko_id,outlet_id])

  return (
    <Context.Provider
      value={{
        removeCart,
        removeQty,
        addQty,
        manualQty,
        cart:cart.filter(c=>c.qty > 0)
      }}
    >
      {children}
    </Context.Provider>
  )
}