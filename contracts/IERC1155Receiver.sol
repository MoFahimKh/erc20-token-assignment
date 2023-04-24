// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IERC1155Receiver {
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4);

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4);
}

//  function mintTo(
//         address _to,
//         uint256 _tokenId,
//         string memory _uri,
//         uint256 _amount
//     ) external {
//         require(owner == msg.sender, "Only owner can mint");
//         uint256 tokenIdToMint;
//         if (_tokenId == type(uint256).max) {
//             tokenIdToMint = nextTokenIdToMint;
//             nextTokenIdToMint += 1;
//             _tokenUris[tokenIdToMint] = _uri;
//         } else {
//             require(_tokenId < nextTokenIdToMint, "This cannot be the tokenId, id doesnt exists");
//             tokenIdToMint = _tokenId;
//         }
//         _balances[tokenIdToMint][_to] += _amount;
//         totalSupply[tokenIdToMint] += _amount;
//         emit TransferSingle(msg.sender, address(0), _to, _tokenId, _amount);
//     }