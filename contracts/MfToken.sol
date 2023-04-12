// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface ERC20Interface {
    function balanceOf(
        address tokenOwner
    ) external view returns (uint256 balance);

    function allowance(
        address tokenOwner,
        address spender
    ) external view returns (uint256 remaining);

    function transfer(
        address to,
        uint256 tokens
    ) external returns (bool success);

    function approve(
        address spender,
        uint256 tokens
    ) external returns (bool success);

    function transferFrom(
        address from,
        address to,
        uint256 tokens
    ) external returns (bool success);

    event Transfer(address indexed from, address indexed to, uint256 tokens);
    event Approval(
        address indexed tokenOwner,
        address indexed spender,
        uint256 tokens
    );
}

contract MfToken is ERC20Interface {
    string private name;
    address private owner;
    string private symbol;
    uint8 private decimals;
    uint256 private totalSupply;
    mapping(address => uint256) internal balances;
    mapping(address => mapping(address => uint256)) internal allowed;

    constructor(uint256 initialSupply) {
        name = "MfToken";
        symbol = "MFT";
        totalSupply = initialSupply;
        decimals = 8;
        balances[msg.sender] = initialSupply;
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
        return true;
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
        return true;
    }

    function mint(address _to, uint256 _amount) external {
        require(msg.sender == owner);
        require(totalSupply + _amount >= totalSupply);
        totalSupply += _amount;
        balances[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    function burn(uint256 _amount) external {
        require(balances[msg.sender] >= _amount && _amount > 0);
        totalSupply -= _amount;
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
}
