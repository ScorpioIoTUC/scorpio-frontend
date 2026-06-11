import { useContext } from 'react'
import { NavbarContext } from './NavbarContextObject'

export function useNavbarContext() {
  return useContext(NavbarContext)
}
