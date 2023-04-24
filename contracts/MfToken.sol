// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface Token {
    /// @param _owner The address from which the balance will be retrieved
    /// @return balance the balance
    function balanceOf(address _owner) external view returns (uint256 balance);

    /// @notice send `_value` token to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return success Whether the transfer was successful or not
    function transfer(
        address _to,
        uint256 _value
    ) external returns (bool success);

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return success Whether the transfer was successful or not
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success);

    /// @notice `msg.sender` approves `_addr` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of wei to be approved for transfer
    /// @return success Whether the approval was successful or not
    function approve(
        address _spender,
        uint256 _value
    ) external returns (bool success);

    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return remaining Amount of remaining tokens allowed to spent
    function allowance(
        address _owner,
        address _spender
    ) external view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
}

contract MfToken is Token {
    string private name;
    address private owner;
    string private symbol;
    uint8 private decimals;
    uint256 private _totalSupply;
    mapping(address => uint256) internal balances;
    mapping(address => mapping(address => uint256)) internal allowed;

    constructor(uint256 initialSupply) {
        name = "MfToken";
        symbol = "MFT";
        decimals = 8;
        _mint(msg.sender, initialSupply);
        owner = msg.sender;
    }

    function getName() external view returns (string memory) {
        return name;
    }

    function getSymbol() external view returns (string memory) {
        return symbol;
    }

    function getDecimals() external view returns (uint8) {
        return decimals;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _owner) external view returns (uint256) {
        return balances[_owner];
    }

    function transfer(
        address _to,
        uint256 _value
    ) external returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value
    ) external returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        success = true;
    }

    function allowance(
        address _owner,
        address _spender
    ) external view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success) {
        require(allowed[_from][msg.sender] >= _value && _value > 0);
        allowed[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        success = true;
    }

    function mint(address _to, uint256 _amount) external {
        require(msg.sender == owner);
        require(_totalSupply + _amount >= _totalSupply);
        _mint(_to, _amount);
    }

    function burn(uint256 _amount) external {
        require(balances[msg.sender] >= _amount && _amount > 0);
        _totalSupply -= _amount;
        balances[msg.sender] -= _amount;
        emit Transfer(msg.sender, address(0), _amount);
    }

    // this internal function is to handle common logic between transfer and transferFrom
    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0));
        require(balances[_from] >= _value && _value > 0);
        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
    }

    function _mint(address _to, uint256 _amount) internal {
        require(_to != address(0));
        _totalSupply += _amount;
        balances[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }
}
