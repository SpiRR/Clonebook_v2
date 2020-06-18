import { writable } from 'svelte/store'

export const user = writable({ 
    "friends": []
 })

 export const post = writable({})

 export const createPost = writable({})

 export const changeDetails = writable({})