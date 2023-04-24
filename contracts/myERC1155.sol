// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./IERC1155Receiver.sol";

/**
 * @title myERC1155
 * @dev This contract implements the ERC1155 standard for fungible and non-fungible tokens,
 * allowing for the creation, transfer and management of tokens.
 */
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

    /**
     * @dev Initializes the contract with a name and symbol.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     */
    constructor(string memory _name, string memory _symbol) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        nextTokenIdToMint = 0;
    }

    /**
     * @dev Gets the balance of the specified token for the specified address.
     * @param _owner The address to query the balance of.
     * @param _tokenId The ID of the token to query the balance of.
     * @return The balance of the specified token for the specified address.
     */
    function balanceOf(
        address _owner,
        uint256 _tokenId
    ) public view returns (uint256) {
        require(_owner != address(0), "Owner must not be zero address");
        return _balances[_tokenId][_owner];
    }

    /**
     * @dev Gets the balances of the specified tokens for the specified addresses.
     * @param _accounts The addresses to query the balances of.
     * @param _tokenIds The IDs of the tokens to query the balances of.
     * @return The balances of the specified tokens for the specified addresses.
     */
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

    /**
     * @dev Sets the approval of the specified operator over all tokens owned by the sender.
     * @param _operator The address of the operator to approve.
     * @param _approved Whether the operator should be approved or not.
     */
    function setApprovalForAll(address _operator, bool _approved) external {
        _operatorApprovals[msg.sender][_operator] = _approved;
    }

    /**
     * @dev Checks whether the specified operator is approved to manage all tokens of the specified owner.
     * @param _account The address of the owner.
     * @param _operator The address of the operator.
     * @return bool `true` if the operator is approved for all tokens of the owner, `false` otherwise.
     */
    function isApprovedForAll(
        address _account,
        address _operator
    ) public view returns (bool) {
        return _operatorApprovals[_account][_operator];
    }

    /**
     * @dev Transfers tokens from one address to another, calling the recipient if it's a contract to
     * perform any additional checks or actions.
     * @param _from Address to transfer tokens from.
     * @param _to Address to transfer tokens to.
     * @param _id ID of the token to transfer.
     * @param _amount Amount of tokens to transfer.
     * @param _data Additional data with no specified format, sent in call to `_to`.
     * Requirements:
     * - `_from` must have a balance of at least `_amount`.
     * - If `_to` is a contract, it must implement `onERC1155Received` and return the acceptance magic value.
     * - If `_data` is non-empty, the recipient must implement `onERC1155Received` and receive the `_data`
     * parameter without any data loss or modification.
     * - The caller must be either the token owner, approved to transfer on the token owner's behalf,
     * or approved to transfer all tokens for the token owner.
     */
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

    /** @dev Safely transfers a batch of tokens from one account to another.
    Requirements:
    _from cannot be the zero address.
    _to cannot be the zero address.
    Both _ids and _amounts arrays must have the same length.
    If _to is a contract, it must implement the onERC1155BatchReceived interface.
    If _data is non-empty, the receiving contract must implement the onERC1155BatchReceived interface.
    _from must have a balance of at least the sum of all _amounts transferred.
    Caller must be approved to manage the tokens being transferred or be the _from account.
    Emits a TransferBatch event. 
    */
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

    /**
    @dev Returns the URI for a given token ID.
    @param _tokenId The identifier of the token to query.
    @return A string representing the URI for the given token ID.
    */
    function uri(uint256 _tokenId) external view returns (string memory) {
        return _tokenUris[_tokenId];
    }

    /**
    @dev Mints a new token with the specified tokenId and amount to the specified address.
    Only the contract owner can call this function.
    @param _to The address to mint the token to.
    @param _tokenId The ID of the token to mint.
    @param _amount The amount of tokens to mint.
    @param _tokenUri The URI of the token metadata.
    */

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

    /**
    @dev Mints multiple ERC1155 tokens and assigns them to specified addresses
    @param _to The addresses of the token recipients
    @param _tokenIds The IDs of the tokens being minted
    @param _amounts The amounts of each token being minted  
    @param tokenUris The URIs associated with each token being minted
    */

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

    /**
     * @dev Internal function to transfer tokens from one address to another.
     * @param _from Address to transfer tokens from.
     * @param _to Address to transfer tokens to.
     * @param _ids Array of token IDs to transfer.
     * @param _amounts Array of amounts to transfer for each token ID.
     */

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

    /**
     * @dev Private function to perform a safe transfer acceptance check.
     * @param operator The operator performing the transfer.
     * @param from The address of the sender.
     * @param to The address of the recipient.
     * @param id The ID of the token being transferred.
     * @param amount The amount of tokens being transferred.
     * @param data Additional data with no specified format, sent in call to `_doSafeTransferAcceptanceCheck`.
     */

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

    /**
     * @dev private function to check if the recipient contract accepts the batch transfer.
     * If the recipient contract implements the IERC1155Receiver interface and accepts the transfer,
     * the function will return normally. Otherwise, the function will revert.
     * @param operator The address of the account transferring the tokens
     * @param from The address of the sender of the tokens
     * @param to The address of the recipient of the tokens
     * @param ids An array of token IDs to transfer
     * @param amounts An array of amounts to transfer for each corresponding token ID
     * @param data Additional data with no specified format to be passed to the recipient contract
     */

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
