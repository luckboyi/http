# http
start import http from 'app/http'

# post 
promise方式
// form date格式,返回的即服务端数据
let serverData=await http.post({
    url:'/test',
    data:{

    }
})
// json格式,返回的即服务端数据
let serverData=await http.post({
    url:'/test',
    json:{

    }
})

# get
promise形式

let serverData=http.get({
    url:'/test',
    data:{

    }
})

# originPost
// form date格式,返回的即服务端数据
let serverData=http.originPost({
    url:'/test',
    data:{

    }
})
// json格式,返回的即服务端数据
let serverData=http.originPost({
    url:'/test',
    json:{

    }
})

# originGet
// form date格式,返回的即服务端数据
let serverData=http.originGet({
    url:'/test',
    data:{

    }
})
# http
