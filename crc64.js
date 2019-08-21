 /*
 
	CRC64 EMAC-182 calculator in Pure JavaScript
	--> to be used in NodeJS as command line in a very simple node enviroment.
 
	Parameters: 16 len hex string
	Usage: node crc64.js 00112233445566
	Output: 8 bytes hex string;
 
	Developer: Bruno Salvador
 
 */
 
 
 var UInt64 = (function () {
            function UInt64(numOrUint64, lowVal) {
                if (typeof numOrUint64 === 'number') {
                    this.highVal = numOrUint64 & 0xFFFFFFFF;
                    this.lowVal = lowVal & 0xFFFFFFFF;
                }
                else {
                    this.highVal = numOrUint64.highVal;
                    this.lowVal = numOrUint64.lowVal;
                }
            }

            UInt64.prototype.clone = function () {
                return new UInt64(this);
            };

            UInt64.FromString = function (strHigh, strLow) {
                var numHigh = 0, numLow = 0;
                if (strLow == undefined) {
                    /* the first parameter string contains the whole number */
                    /* remove preceeding '0x' prefix */
                    if (strHigh.substr(0, 2) === "0x") {
                        strHigh = strHigh.substr(2, strHigh.length - 2);
                    }
                    /* pad to full 16 digits */
                    while (strHigh.length < 16) {
                        strHigh = '0' + strHigh;
                    }
                    numHigh = parseInt(strHigh.substr(0, 8), 16);
                    numLow = parseInt(strHigh.substr(8, 15), 16);
                }
                else {
                    /* two 32bit numbers are provided */
                    /* handle high part */
                    /* remove preceeding '0x' prefix */
                    if (strHigh.substr(0, 2) === "0x") {
                        strHigh = strHigh.substr(2, strHigh.length - 2);
                    }
                    /* pad to full 8 digits */
                    while (strHigh.length < 8) {
                        strHigh = '0' + strHigh;
                    }
                    numHigh = parseInt(strHigh, 16);
                    /* handle low part */
                    /* remove preceeding '0x' prefix */
                    if (strLow.substr(0, 2) === "0x") {
                        strLow = strLow.substr(2, strLow.length - 2);
                    }
                    /* pad to full 8 digits */
                    while (strLow.length < 8) {
                        strLow = '0' + strLow;
                    }
                    numLow = parseInt(strLow, 16);
                }
                return new UInt64(numHigh, numLow);
            };

            UInt64.prototype.and = function (otherUInt64OrNumber) {
                if (typeof otherUInt64OrNumber === 'number') {
                    this.highVal = 0;
                    this.lowVal = this.lowVal & otherUInt64OrNumber;
                }
                else {
                    this.highVal = this.highVal & otherUInt64OrNumber.highVal;
                    this.lowVal = this.lowVal & otherUInt64OrNumber.lowVal;
                }
                return this;
            };

            UInt64.prototype.shl = function (dist) {
                for (var i = 0; i < dist; i++) {
                    this.highVal = this.highVal << 1;
                    if ((this.lowVal & 0x80000000) != 0) {
                        this.highVal |= 0x01;
                    }
                    this.lowVal = this.lowVal << 1;
                }
                return this;
            };
            UInt64.prototype.shr = function (dist) {
                for (var i = 0; i < dist; i++) {
                    this.lowVal = this.lowVal >>> 1;
                    if ((this.highVal & 0x00000001) != 0) {
                        this.lowVal |= 0x80000000;
                    }
                    this.highVal = this.highVal >>> 1;
                }
                return this;
            };

            UInt64.prototype.isZero = function () {
                return ((this.highVal == 0) && (this.lowVal == 0));
            };

            UInt64.prototype.xor = function (otherUInt64) {
                this.highVal = this.highVal ^ otherUInt64.highVal;
                this.lowVal = this.lowVal ^ otherUInt64.lowVal;
                return this;
            };

            UInt64.prototype.reflect = function () {
                var newHighVal = 0, newLowVal = 0;
                for (var i = 0; i < 32; i++) {
                    if ((this.highVal & (1 << (31 - i))) != 0) {
                        newLowVal |= (1 << i);
                    }
                    if ((this.lowVal & (1 << i)) != 0) {
                        newHighVal |= (1 << (31 - i));
                    }
                }
                this.lowVal = newLowVal;
                this.highVal = newHighVal;
                return this;
            };

            UInt64.prototype.toHexString = function () {
                var str = "";
                var stringUtil = new StringUtil();
                str += stringUtil.getNumberAsHexStr32FixedWidth(this.highVal);
                str += (stringUtil.getNumberAsHexStr32FixedWidth(this.lowVal).substring(2, 10));
                return str;
            };
            UInt64.prototype.asNumber = function () {
                return ((this.highVal << 32) | this.lowVal);
            };
            return UInt64;
        })();

 var StringUtil = function () {
            if (StringUtil.prototype._singletonInstance) {
                return StringUtil.prototype._singletonInstance;
            }
            StringUtil.prototype._singletonInstance = this;

            /*
             * Converts a string into an array of bytes.
             * This is not really correct as an character (unicode!) does not always fit into a byte, so the
             * character value might be cut!
             */
            this.getCharacterByteArrayFromString = function (str) {
                var i, charVal;
                var bytes = [];
                for (i = 0; i < str.length; i++) {
                    charVal = str.charCodeAt(i);
                    if (charVal < 256) {
                        bytes[i] = str.charCodeAt(i);
                    }
                }
                return bytes;
            };

            /*
             * Get the given number as hexadecimal string
             */
            this.getNumberAsHexStr = function (num) {
                var tempStr = num.toString(16).toUpperCase();
                return ("0x" + tempStr);
            }

            this.getNumberAsHexStr = function (num, widthInBits) {
                var tempStr = num.toString(16).toUpperCase();
                while (tempStr.length < (widthInBits >> 2)) {
                    tempStr = '0' + tempStr;
                }
                return ("0x" + tempStr);
            }

            /*
             * Get the given 32bit number as hexadecimal string
             */
            this.getNumberAsHexStr32 = function (num) {
                var valueHigh = num >>> 16;
                var valueLow = num & 0x0000FFFF;
                return ("0x" + valueHigh.toString(16).toUpperCase() + valueLow.toString(16).toUpperCase());
            }

            this.getNumberAsHexStr32FixedWidth = function (num) {
                var valueHigh = num >>> 16;
                valueHigh = valueHigh.toString(16).toUpperCase()
                while (valueHigh.length < 4) {
                    valueHigh = '0' + valueHigh;
                }

                var valueLow = num & 0x0000FFFF;
                valueLow = valueLow.toString(16).toUpperCase()
                while (valueLow.length < 4) {
                    valueLow = '0' + valueLow;
                }

                return ("0x" + valueHigh + valueLow);
            }

            var lastErrToken;
            /*
             * Get value of token where a call to getCharacterByteArrayFromByteString might have failed. */
            this.getLastErrorToken = function () {
                return lastErrToken;
            }

            /*
             * Converts a string of byte values into an array of bytes.
             * Returns undefined if an errors occurs. The erroneous token can be retrieved by getLastErrorToken().
             */
            this.getCharacterByteArrayFromByteString = function (str) {
                var bytes = [];
                var bytePos = 0;
                var splitStr = str.split(/\s+/);
                for (var i = 0; i < splitStr.length; i++) {
                    var byteStr = splitStr[i];
                    if (byteStr.substr(0, 2) === "0x") {
                        byteStr = byteStr.substr(2, byteStr.length - 2);
                    }

                    if (byteStr === " " || byteStr === "")
                        continue;

                    var b = parseInt(byteStr, 16);
                    if (b === NaN || b === undefined) {
                        lastErrToken = byteStr;
                        return undefined;
                    }
                    else {
                        if (b < 256) {
                            bytes[bytePos] = b;
                            bytePos++;
                        }
                        else {
                            lastErrToken = byteStr;
                            return undefined;
                        }

                    }
                }
                return bytes;
            }

            this.isBinaryString = function (s) {
                for (var i = 0; i < s.length; i++) {
                    if (!(s[i] == '0' || s[i] == '1'))
                        return false;
                }
                return true;
            };

            /*
             * Converts a binary string, consisting of 0 and 1, to a numerical byte array.
             * Each eight binary digits (forming a byte) must be separated by a space.
             * Example: 10000100 11110001 represents byte array 0x84 0xF1
             */
            this.getCharacterByteArrayFromBinaryString = function (str) {
                var bytes = [];
                var parts = str.split(/\s+/);
                for (var strIdx = 0; strIdx < parts.length; strIdx++) {
                    var strPart = parts[strIdx];
                    while (strPart.length < 8) {
                        strPart = '0' + strPart;
                    }
                    if (!(new StringUtil().isBinaryString(strPart))) {
                        lastErrToken = strPart;
                        return undefined;
                    }
                    var num = 0;
                    for (var i = 0; i < 8; i++) {
                        if (strPart[i] == '1') {
                            num = num + (1 << (7 - i));
                        }
                    }
                    bytes.push(num);
                }
                return bytes;
            }

        };

/*
function calcCrcTable()
{
    crcTable = new Array(256);
    polynomial = new UInt64(0x42F0E1EB, 0xA9EA3693);
        for (var divident = 0; divident < 256; divident++) {
            var currByte = new UInt64(0, divident);
            currByte.shl(56).and(castMask);
            for (var bit = 0; bit < 8; bit++) {
                if (!(new UInt64(currByte).and(msbMask).isZero())) {
                    currByte.shl(1);
                    currByte.xor(polynomial);
                }
                else {
                    currByte.shl(1);
                }
            }
            crcTable[divident] = currByte.and(castMask).toHexString();
            console.log('\"' + crcTable[divident] + '\",');
        }
        return crcTable;
    
}
*/
const crcTable = [
"0x0000000000000000","0x42F0E1EBA9EA3693",
"0x85E1C3D753D46D26","0xC711223CFA3E5BB5",
"0x493366450E42ECDF","0x0BC387AEA7A8DA4C",
"0xCCD2A5925D9681F9","0x8E224479F47CB76A",
"0x9266CC8A1C85D9BE","0xD0962D61B56FEF2D",
"0x17870F5D4F51B498","0x5577EEB6E6BB820B",
"0xDB55AACF12C73561","0x99A54B24BB2D03F2",
"0x5EB4691841135847","0x1C4488F3E8F96ED4",
"0x663D78FF90E185EF","0x24CD9914390BB37C",
"0xE3DCBB28C335E8C9","0xA12C5AC36ADFDE5A",
"0x2F0E1EBA9EA36930","0x6DFEFF5137495FA3",
"0xAAEFDD6DCD770416","0xE81F3C86649D3285",
"0xF45BB4758C645C51","0xB6AB559E258E6AC2",
"0x71BA77A2DFB03177","0x334A9649765A07E4",
"0xBD68D2308226B08E","0xFF9833DB2BCC861D",
"0x388911E7D1F2DDA8","0x7A79F00C7818EB3B",
"0xCC7AF1FF21C30BDE","0x8E8A101488293D4D",
"0x499B3228721766F8","0x0B6BD3C3DBFD506B",
"0x854997BA2F81E701","0xC7B97651866BD192",
"0x00A8546D7C558A27","0x4258B586D5BFBCB4",
"0x5E1C3D753D46D260","0x1CECDC9E94ACE4F3",
"0xDBFDFEA26E92BF46","0x990D1F49C77889D5",
"0x172F5B3033043EBF","0x55DFBADB9AEE082C",
"0x92CE98E760D05399","0xD03E790CC93A650A",
"0xAA478900B1228E31","0xE8B768EB18C8B8A2",
"0x2FA64AD7E2F6E317","0x6D56AB3C4B1CD584",
"0xE374EF45BF6062EE","0xA1840EAE168A547D",
"0x66952C92ECB40FC8","0x2465CD79455E395B",
"0x3821458AADA7578F","0x7AD1A461044D611C",
"0xBDC0865DFE733AA9","0xFF3067B657990C3A",
"0x711223CFA3E5BB50","0x33E2C2240A0F8DC3",
"0xF4F3E018F031D676","0xB60301F359DBE0E5",
"0xDA050215EA6C212F","0x98F5E3FE438617BC",
"0x5FE4C1C2B9B84C09","0x1D14202910527A9A",
"0x93366450E42ECDF0","0xD1C685BB4DC4FB63",
"0x16D7A787B7FAA0D6","0x5427466C1E109645",
"0x4863CE9FF6E9F891","0x0A932F745F03CE02",
"0xCD820D48A53D95B7","0x8F72ECA30CD7A324",
"0x0150A8DAF8AB144E","0x43A04931514122DD",
"0x84B16B0DAB7F7968","0xC6418AE602954FFB",
"0xBC387AEA7A8DA4C0","0xFEC89B01D3679253",
"0x39D9B93D2959C9E6","0x7B2958D680B3FF75",
"0xF50B1CAF74CF481F","0xB7FBFD44DD257E8C",
"0x70EADF78271B2539","0x321A3E938EF113AA",
"0x2E5EB66066087D7E","0x6CAE578BCFE24BED",
"0xABBF75B735DC1058","0xE94F945C9C3626CB",
"0x676DD025684A91A1","0x259D31CEC1A0A732",
"0xE28C13F23B9EFC87","0xA07CF2199274CA14",
"0x167FF3EACBAF2AF1","0x548F120162451C62",
"0x939E303D987B47D7","0xD16ED1D631917144",
"0x5F4C95AFC5EDC62E","0x1DBC74446C07F0BD",
"0xDAAD56789639AB08","0x985DB7933FD39D9B",
"0x84193F60D72AF34F","0xC6E9DE8B7EC0C5DC",
"0x01F8FCB784FE9E69","0x43081D5C2D14A8FA",
"0xCD2A5925D9681F90","0x8FDAB8CE70822903",
"0x48CB9AF28ABC72B6","0x0A3B7B1923564425",
"0x70428B155B4EAF1E","0x32B26AFEF2A4998D",
"0xF5A348C2089AC238","0xB753A929A170F4AB",
"0x3971ED50550C43C1","0x7B810CBBFCE67552",
"0xBC902E8706D82EE7","0xFE60CF6CAF321874",
"0xE224479F47CB76A0","0xA0D4A674EE214033",
"0x67C58448141F1B86","0x253565A3BDF52D15",
"0xAB1721DA49899A7F","0xE9E7C031E063ACEC",
"0x2EF6E20D1A5DF759","0x6C0603E6B3B7C1CA",
"0xF6FAE5C07D3274CD","0xB40A042BD4D8425E",
"0x731B26172EE619EB","0x31EBC7FC870C2F78",
"0xBFC9838573709812","0xFD39626EDA9AAE81",
"0x3A28405220A4F534","0x78D8A1B9894EC3A7",
"0x649C294A61B7AD73","0x266CC8A1C85D9BE0",
"0xE17DEA9D3263C055","0xA38D0B769B89F6C6",
"0x2DAF4F0F6FF541AC","0x6F5FAEE4C61F773F",
"0xA84E8CD83C212C8A","0xEABE6D3395CB1A19",
"0x90C79D3FEDD3F122","0xD2377CD44439C7B1",
"0x15265EE8BE079C04","0x57D6BF0317EDAA97",
"0xD9F4FB7AE3911DFD","0x9B041A914A7B2B6E",
"0x5C1538ADB04570DB","0x1EE5D94619AF4648",
"0x02A151B5F156289C","0x4051B05E58BC1E0F",
"0x87409262A28245BA","0xC5B073890B687329",
"0x4B9237F0FF14C443","0x0962D61B56FEF2D0",
"0xCE73F427ACC0A965","0x8C8315CC052A9FF6",
"0x3A80143F5CF17F13","0x7870F5D4F51B4980",
"0xBF61D7E80F251235","0xFD913603A6CF24A6",
"0x73B3727A52B393CC","0x31439391FB59A55F",
"0xF652B1AD0167FEEA","0xB4A25046A88DC879",
"0xA8E6D8B54074A6AD","0xEA16395EE99E903E",
"0x2D071B6213A0CB8B","0x6FF7FA89BA4AFD18",
"0xE1D5BEF04E364A72","0xA3255F1BE7DC7CE1",
"0x64347D271DE22754","0x26C49CCCB40811C7",
"0x5CBD6CC0CC10FAFC","0x1E4D8D2B65FACC6F",
"0xD95CAF179FC497DA","0x9BAC4EFC362EA149",
"0x158E0A85C2521623","0x577EEB6E6BB820B0",
"0x906FC95291867B05","0xD29F28B9386C4D96",
"0xCEDBA04AD0952342","0x8C2B41A1797F15D1",
"0x4B3A639D83414E64","0x09CA82762AAB78F7",
"0x87E8C60FDED7CF9D","0xC51827E4773DF90E",
"0x020905D88D03A2BB","0x40F9E43324E99428",
"0x2CFFE7D5975E55E2","0x6E0F063E3EB46371",
"0xA91E2402C48A38C4","0xEBEEC5E96D600E57",
"0x65CC8190991CB93D","0x273C607B30F68FAE",
"0xE02D4247CAC8D41B","0xA2DDA3AC6322E288",
"0xBE992B5F8BDB8C5C","0xFC69CAB42231BACF",
"0x3B78E888D80FE17A","0x7988096371E5D7E9",
"0xF7AA4D1A85996083","0xB55AACF12C735610",
"0x724B8ECDD64D0DA5","0x30BB6F267FA73B36",
"0x4AC29F2A07BFD00D","0x08327EC1AE55E69E",
"0xCF235CFD546BBD2B","0x8DD3BD16FD818BB8",
"0x03F1F96F09FD3CD2","0x41011884A0170A41",
"0x86103AB85A2951F4","0xC4E0DB53F3C36767",
"0xD8A453A01B3A09B3","0x9A54B24BB2D03F20",
"0x5D45907748EE6495","0x1FB5719CE1045206",
"0x919735E51578E56C","0xD367D40EBC92D3FF",
"0x1476F63246AC884A","0x568617D9EF46BED9",
"0xE085162AB69D5E3C","0xA275F7C11F7768AF",
"0x6564D5FDE549331A","0x279434164CA30589",
"0xA9B6706FB8DFB2E3","0xEB46918411358470",
"0x2C57B3B8EB0BDFC5","0x6EA7525342E1E956",
"0x72E3DAA0AA188782","0x30133B4B03F2B111",
"0xF7021977F9CCEAA4","0xB5F2F89C5026DC37",
"0x3BD0BCE5A45A6B5D","0x79205D0E0DB05DCE",
"0xBE317F32F78E067B","0xFCC19ED95E6430E8",
"0x86B86ED5267CDBD3","0xC4488F3E8F96ED40",
"0x0359AD0275A8B6F5","0x41A94CE9DC428066",
"0xCF8B0890283E370C","0x8D7BE97B81D4019F",
"0x4A6ACB477BEA5A2A","0x089A2AACD2006CB9",
"0x14DEA25F3AF9026D","0x562E43B4931334FE",
"0x913F6188692D6F4B","0xD3CF8063C0C759D8",
"0x5DEDC41A34BBEEB2","0x1F1D25F19D51D821",
"0xD80C07CD676F8394","0x9AFCE626CE85B507"];
function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

function toStrHex(string) {

  var bytes = new Uint8Array(Math.ceil(string.length / 2));
  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(string.substr(i * 2, 2), 16);
  }
  return bytes;
}


function CRC64(hexString) {
   var castMask = new UInt64(0xFFFFFFFF, 0xFFFFFFFF);
  // var msbMask =  new UInt64(0x80000000, 0x00000000);

    var initialVal = new UInt64(0,0);
   // var finalXorVal = new UInt64(0,0);
    var crc = initialVal.clone();
    var bytes = toStrHex(hexString);

 // var crcTable = calcCrcTable();
 
  for (var i = 0; i < bytes.length; i++) {

      var curByte = bytes[i] & 0xFF;
      /* update the MSB of crc value with next input byte */
     // console.log(curByte);
      var curByteShifted56 = new UInt64(0, curByte).shl(56);
     // console.log(curByteShifted56);
      crc.xor(curByteShifted56).and(castMask);
      //console.log(crc);

      /* this MSB byte value is the index into the lookup table */
      var pos = (crc.clone().shr(56)).and(0xFF).asNumber();
     // console.log(pos);
      /* shift out this index */
      crc.shl(8).and(castMask);
      /* XOR-in remainder from lookup table using the calculated index */
      var valueCrc = new UInt64.FromString(crcTable[pos]);
      crc.xor(valueCrc).and(castMask);
  }
  return crc.toHexString();
}

/*

	test function to test functionality of algorithm

*/
function test() {
  const comandos = [
    "0100004002000000DA8757A68637ACD0",
"0100004002000000DA8757A68637ACD0",
"02000040020000006850154DD9959F48",
"0300004002000000061D2B14ECF471C0",
"04000040020000004F0E7170CF3BCEEB",
"050000400200000021434F29FA5A2063",
"060000400200000093940DC2A5F813FB",
"0700004002000000FDD9339B9099FD73",
"080000400200000001B2B90AE2676DAD",
"09000040020000006FFF8753D7068325",
"0A00004002000000DD28C5B888A4B0BD",
"0B00004002000000B365FBE1BDC55E35",
"0C00004002000000FA76A1859E0AE11E",
"0D00004002000000943B9FDCAB6B0F96",
"0E0000400200000026ECDD37F4C93C0E",
"0F0000400200000048A1E36EC1A8D286",
"10000040020000009CCB29FEB8DE2B21",
"1100004002000000F28617A78DBFC5A9",
"12000040020000004051554CD21DF631",
"13000040020000002E1C6B15E77C18B9",
"1400004002000000670F3171C4B3A792",
"150000400200000009420F28F1D2491A",
"1600004002000000BB954DC3AE707A82",
"1700004002000000D5D8739A9B11940A",
"180000400200000029B3F90BE9EF04D4",
"190000400200000047FEC752DC8EEA5C",
"1A00004002000000F52985B9832CD9C4",
"1B000040020000009B64BBE0B64D374C",
"1C00004002000000D277E18495828867",
"1D00004002000000BC3ADFDDA0E366EF",
"1E000040020000000EED9D36FF415577",
"1F0000400200000060A0A36FCA20BBFF",
"2000004002000000E4C8E9FDA44690AA",
"21000040020000008A85D7A491277E22",
"22000040020000003852954FCE854DBA",
"2300004002000000561FAB16FBE4A332",
"24000040020000001F0CF172D82B1C19",
"25000040020000007141CF2BED4AF291",
"2600004002000000C3968DC0B2E8C109",
"2700004002000000ADDBB39987892F81",
"280000400200000051B03908F577BF5F",
"29000040020000003FFD0751C01651D7",
"2A000040020000008D2A45BA9FB4624F",
"2B00004002000000E3677BE3AAD58CC7",
"2C00004002000000AA742187891A33EC",
"2D00004002000000C4391FDEBC7BDD64",
"2E0000400200000076EE5D35E3D9EEFC",
"2F0000400200000018A3636CD6B80074",
"3000004002000000CCC9A9FCAFCEF9D3"];
  for (i=0; i <= comandos.length -1 ; i++) {
    var parte1 = comandos[i].substring(0,16);
    var crc = CRC64(parte1).substring(2,18);
    var readCrc = comandos[i].substring(16,33);
    if (readCrc == crc) {
      console.log("valido");
    } else {
      console.log (readCrc + " <> " + crc);
    }
  }
}
//test();
//console.log(CRC64("0100004002000000"));
//console.log(CRC64("0200004002000000"));



if (process.argv.length == 2) {
	var arg = process.argv[2];
	if (arg.length == 16) {
		console.log(CRC64(arg));
	}
}

