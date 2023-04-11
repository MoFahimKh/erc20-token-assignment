// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface ERC20Interface {
    function balanceOf(address tokenOwner) external view returns (uint balance);

    function allowance(
        address tokenOwner,
        address spender
    ) external view returns (uint remaining);

    function transfer(address to, uint tokens) external returns (bool success);

    function approve(
        address spender,
        uint tokens
    ) external returns (bool success);

    function transferFrom(
        address from,
        address to,
        uint tokens
    ) external returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(
        address indexed tokenOwner,
        address indexed spender,
        uint tokens
    );
}

contract MfToken is ERC20Interface {
    string public constant name = "Mf Token";
    string public constant symbol = "MFT";
    uint8 public constant decimals = 8;
    uint256 public totalSupply;
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;
        balances[msg.sender] = initialSupply;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(balances[msg.sender] >= _value && _value > 0);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            balances[_from] >= _value &&
                allowed[_from][msg.sender] >= _value &&
                _value > 0
        );
        balances[_from] -= _value;
        allowed[_from][msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
