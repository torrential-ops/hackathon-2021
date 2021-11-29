import { ChainId } from "@usedapp/core"

export type AddressMap = {[ChainId: number]: string}

export const RAINDROPS_ADDRESSES: AddressMap = {
    [ChainId.Rinkeby]: '0x189B5b93053DBB00640bD9fC5493584ae261505d'
}