function load(url, data = null) {
    return new Promise((resolve, reject) => {
        const encodeData = (data) => {
            const result = [];
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                }
            }
            return result.join("&");
        };

        const request = new XMLHttpRequest();
        const method = data === null ? "GET" : "POST";
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status >= 200 && request.status < 300) {
                    try {
                        resolve(JSON.parse(request.responseText));
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(request.status + ": " + request.responseText);
                }
            }
        };
        request.open(method, url, true);
        if (data !== null) {
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.send(encodeData(data));
        } else {
            request.send();
        }
    });
}