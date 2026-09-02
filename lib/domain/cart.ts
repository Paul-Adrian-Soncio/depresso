export interface CartLine {
  menuItemId: string;
  menuItemName: string;
  priceCents: number;
  quantity: number;
}

export type Cart = CartLine[];

export function cartTotalCents(cart: Cart): number {
  return cart.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

export function cartItemCount(cart: Cart): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}
