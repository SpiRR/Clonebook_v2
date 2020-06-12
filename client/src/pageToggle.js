import {writable} from 'svelte/store'

export const showPage = writable({
    "pageShown": "home"
})
