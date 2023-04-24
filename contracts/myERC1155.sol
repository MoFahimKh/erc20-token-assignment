// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./IERC1155Receiver.sol";

contract myERC1155 {
    // token Id => (address => balance)
    mapping(uint256 => mapping(address => uint256)) internal _balances;

    //owner => (operator => bool)
    mapping(address => mapping(address => bool)) internal _operatorApprovals;

    //token Id => token URI
    mapping(uint256 => string) internal _tokenUris;

    //token ID => supply
    mapping(uint256 => uint256) public totalSupply;

    string private name;
    string public symbol;
    address public owner;
    uint256 public nextTokenIdToMint;

    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );
    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    );

    event ApprovalForAll(
        address indexed account,
        address indexed operator,
        bool approved
    );

    constructor(string memory _name, string memory _symbol) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        nextTokenIdToMint = 0;
    }

    function balanceOf(
        address _owner,
        uint256 _tokenId
    ) public view returns (uint256) {
        require(_owner != address(0), "Owner must not be zero address");
        return _balances[_tokenId][_owner];
    }

    function balanceOfBatch(
        address[] memory _accounts,
        uint256[] memory _tokenIds
    ) external view returns (uint256[] memory) {
        require(
            _accounts.length == _tokenIds.length,
            "account's length must be equal to tokenId's length!"
        );

        uint256[] memory balances = new uint256[](_accounts.length);
        for (uint256 i = 0; i < _accounts.length; i++) {
            balances[i] = balanceOf(_accounts[i], _tokenIds[i]);
        }
        return balances;
    }

    function setApprovalForAll(address _operator, bool _approved) external {
        _operatorApprovals[msg.sender][_operator] = _approved;
    }

    function isApprovedForAll(
        address _account,
        address _operator
    ) public view returns (bool) {
        return _operatorApprovals[_account][_operator];
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _amount,
        bytes memory _data
    ) external {
        require(
            _from == msg.sender || isApprovedForAll(_from, msg.sender),
            "not authorized"
        );
        uint256[] memory ids = new uint256[](1);
        uint256[] memory amounts = new uint256[](1);
        ids[0] = _id;
        amounts[0] = _amount;
        _transfer(_from, _to, ids, amounts);
        emit TransferSingle(msg.sender, _from, _to, _id, _amount);
        _doSafeTransferAcceptanceCheck(
            msg.sender,
            _from,
            _to,
            _id,
            _amount,
            _data
        );
    }

    function safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory data
    ) external {
        require(
            _from == msg.sender || isApprovedForAll(_from, msg.sender),
            "not authorized"
        );
        require(
            _ids.length == _amounts.length,
            "amounts and ids count mismatch"
        );
        _transfer(_from, _to, _ids, _amounts);
        emit TransferBatch(msg.sender, _from, _to, _ids, _amounts);
        _doSafeBatchTransferAcceptanceCheck(
            msg.sender,
            _from,
            _to,
            _ids,
            _amounts,
            data
        );
    }

    function uri(uint256 _tokenId) external view returns (string memory) {
        return _tokenUris[_tokenId];
    }

    function mint(
        address _to,
        uint256 _tokenId,
        uint256 _amount,
        string memory _tokenUri
    ) external {
        require(msg.sender == owner, "Only owner can mint tokens");
        require(_to != address(0), "Cannot mint to zero address");
        require(_amount > 0, "Cannot mint zero amount of tokens");
        require(
            _tokenId >= nextTokenIdToMint,
            "Token ID must be greater than or equal to nextTokenIdToMint"
        );

        _balances[_tokenId][_to] += _amount;
        totalSupply[_tokenId] += _amount;
        _tokenUris[_tokenId] = _tokenUri;
        emit TransferSingle(msg.sender, address(0), _to, _tokenId, _amount);
        nextTokenIdToMint = _tokenId + 1;
    }

    function mintBatch(
        address[] memory _to,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        string[] memory tokenUris
    ) external {
        require(msg.sender == owner, "Only owner can mint tokens");
        require(
            _to.length == _tokenIds.length,
            "to and tokenIds count mismatch"
        );
        require(
            _tokenIds.length == _amounts.length,
            "tokenIds and amounts count mismatch"
        );
        require(
            _tokenIds.length == tokenUris.length,
            "tokenIds and URIs count mismatch"
        );

        for (uint256 i = 0; i < _to.length; i++) {
            require(_to[i] != address(0), "Cannot mint to zero address");
            require(_amounts[i] > 0, "Cannot mint zero amount of tokens");
            require(
                _tokenIds[i] >= nextTokenIdToMint,
                "Token ID must be greater than or equal to nextTokenIdToMint"
            );

            _balances[_tokenIds[i]][_to[i]] += _amounts[i];
            totalSupply[_tokenIds[i]] += _amounts[i];
            tokenUris[_tokenIds[i]] = tokenUris[i];

            emit TransferBatch(
                msg.sender,
                address(0),
                _to[i],
                _tokenIds,
                _amounts
            );
        }

        nextTokenIdToMint = _tokenIds[_tokenIds.length - 1] + 1;
    }

    function _transfer(
        address _from,
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) internal {
        require(_to != address(0), "Cannot transfer to zero address");

        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 id = _ids[i];
            uint256 amount = _amounts[i];
            uint256 fromBalance = _balances[id][_from];
            require(
                fromBalance >= amount,
                "Cannot transfer amount greater than balance"
            );
            _balances[id][_from] -= amount;
            _balances[id][_to] += amount;
        }
    }

    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        if (to.code.length > 0) {
            try
                IERC1155Receiver(to).onERC1155Received(
                    operator,
                    from,
                    id,
                    amount,
                    data
                )
            returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155Received.selector) {
                    revert("Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("Transfering to a non-receiver implementer");
            }
        }
    }

    function _doSafeBatchTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        if (to.code.length > 0) {
            try
                IERC1155Receiver(to).onERC1155BatchReceived(
                    operator,
                    from,
                    ids,
                    amounts,
                    data
                )
            returns (bytes4 response) {
                if (
                    response != IERC1155Receiver.onERC1155BatchReceived.selector
                ) {
                    revert("Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("Transfering to a non-receiver implementer");
            }
        }
    }
}
