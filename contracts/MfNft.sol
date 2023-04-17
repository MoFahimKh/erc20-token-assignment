// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) external returns (bytes4);
}

interface ERC721Interface {
    function balanceOf(address owner) external view returns (uint256 balance);

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferFrom(address from, address to, uint256 tokenId) external;

    function approve(address to, uint256 tokenId) external;

    function setApprovalForAll(address operator, bool approved) external;

    function getApproved(
        uint256 tokenId
    ) external view returns (address operator);

    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool);
}

contract MfNft is ERC721Interface {
    string private _name;
    string private _symbol;
    uint256 private _totalSupply;
    // uint256 private _tokenID;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed operator,
        uint256 indexed tokenId
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) external view override returns (uint256) {
        require(
            owner != address(0),
            "MfNft: balance query for the zero address"
        );
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _owners[tokenId];
        require(
            owner == address(0) || owner == _owners[tokenId],
            "MfNft: owner query for nonexistent token"
        );
        return owner;
    }

    function mint(address to, uint256 tokenId) external {
        require(to != address(0), "MfNft: cannot mint a NFT for zero address");
        require(!_exists(tokenId), "MfNft: tokenID already exists");
        _owners[tokenId] = to;
        _mint(to, tokenId);
    }

    function _mint(address _to, uint256 _amount) internal {
        //require(_to != address(0));
        _totalSupply += 1;
        _balances[_to] += 1;
        emit Transfer(address(0), _to, _amount);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public {
        transferFrom(from, to, tokenId);
        require(
            _checkOnERC721Received(from, to, tokenId, data),
            "MfNft : transfer to non ERC721Receiver implementer"
        );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        safeTransferFrom(from, to, tokenId, "");
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(
            ownerOf(tokenId) == from,
            "MfNft: transfer of token that is not own"
        );
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "MfNft: transfer caller is not owner nor approved"
        );
        require(to != address(0), "MfNft: transfer to the zero address");
        _clearApproval(from, tokenId);
        _owners[tokenId] = to;
        _balances[from]--;
        _balances[to]++;

        emit Transfer(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) external override {
        address owner = ownerOf(tokenId);
        require(to != owner, "MfNft: approval to current owner");
        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "MfNft: approve caller is not owner nor approved for all"
        );
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) external override {
        require(operator != msg.sender, "MfNft: invalid operator");
        require(
            operator != address(0),
            "MfNft: address(0) must not be the operator"
        );
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(
        uint256 tokenId
    ) public view override returns (address) {
        require(
            _owners[tokenId] != address(0),
            "MfNft: approved query for nonexistent token"
        );
        return _tokenApprovals[tokenId];
    }

    function isApprovedForAll(
        address owner,
        address operator
    ) public view override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    function _clearApproval(address owner, uint256 tokenId) internal {
        require(
            ownerOf(tokenId) == owner,
            "MfNft: clearApproval caller is not owner"
        );
        if (_tokenApprovals[tokenId] != address(0)) {
            _tokenApprovals[tokenId] = address(0);
            emit Approval(owner, address(0), tokenId);
        }
    }

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0x0);
    }

    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal returns (bool) {
        if (isContract(to)) {
            bytes4 retval = IERC721Receiver(to).onERC721Received(
                msg.sender,
                from,
                tokenId,
                data
            );
            return (retval ==
                bytes4(
                    keccak256("onERC721Received(address,adrress,uint256,bytes)")
                ));
        } else {
            return true;
        }
    }
}
