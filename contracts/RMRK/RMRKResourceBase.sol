// SPDX-License-Identifier: Apache-2.0

import "./RMRKResourceCore.sol";
import "./IRMRKResourceBase.sol";

contract RMRKResourceBase is RMRKResourceCore {
    constructor() RMRKResourceCore("dummyResource") {}
}
