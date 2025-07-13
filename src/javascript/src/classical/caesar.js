function rot13(str) {
    var solved = ''
    for (var i = 0; i < str.length; i++) {
       console.log(str[i].charCodeAt())
       var asciiNum = str[i].charCodeAt()
       if (asciiNum >= 65 && asciiNum <= 77) {
        solved += String.fromCharCode(asciiNum + 13)
       } else if (ascii >= 78 && asciiNum <= 90) {
        solved += String.fromCharCode(asciiNum - 13)
       } else {
        solved += str[i]
       }
    }
    return solved
}




rot13('Z')