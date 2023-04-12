# MfToken - ERC20 token Assignment

MfToken is an implementation of the ERC20 token standard on the Ethereum blockchain. It is a simple token that can be transferred and approved for transfer by other accounts.

## Functions

### `balanceOf(address tokenOwner) external view returns (uint balance)`

Returns the token balance of the specified account.

### `allowance(address tokenOwner, address spender) external view returns (uint remaining)`

Returns the remaining number of tokens that the specified spender is allowed to spend on behalf of the token owner.

### `transfer(address to, uint tokens) external returns (bool success)`

Transfers tokens from the sender's account to the specified account.

### `approve(address spender, uint tokens) external returns (bool success)`

Allows the specified spender to transfer the specified amount of tokens from the sender's account.

### `transferFrom(address from, address to, uint tokens) external returns (bool success)`

Transfers tokens from the specified account to the specified account on behalf of the specified spender.

## Events

### `Transfer(address indexed from, address indexed to, uint tokens)`

Emitted when tokens are transferred from one account to another.

### `Approval(address indexed tokenOwner, address indexed spender, uint tokens)`

Emitted when the token owner approves the spender to spend tokens on their behalf.
