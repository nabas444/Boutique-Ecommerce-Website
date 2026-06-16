(async () => {
  try {
    const base = "http://localhost:4000/api";
    const loginRes = await fetch(base + "/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "customer@example.com",
        password: "Customer@1234",
      }),
    });
    const login = await loginRes.json();
    console.log("LOGIN", JSON.stringify(login));
    if (!login.success) {
      console.error("Login failed");
      process.exit(1);
    }
    const token = login.data.accessToken;

    const prodRes = await fetch(base + "/products?limit=1");
    const prodJson = await prodRes.json();
    console.log("PRODUCTS", JSON.stringify(prodJson));
    const prod =
      prodJson.data?.products?.[0] || prodJson.data?.[0] || prodJson.data;
    const productId = prod?.id;
    if (!productId) {
      console.error("No product id found");
      process.exit(1);
    }
    console.log("PRODUCT_ID", productId);

    const variantId = prod.variants?.[0]?.id || null;
    const addRes = await fetch(base + `/wishlist/${productId}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({ variantId }),
    });
    const addJson = await addRes.json();
    console.log("ADD", JSON.stringify(addJson));

    const listRes = await fetch(base + "/wishlist", {
      headers: { authorization: "Bearer " + token },
    });
    const listJson = await listRes.json();
    console.log("LIST", JSON.stringify(listJson));

    const delRes = await fetch(base + `/wishlist/${productId}`, {
      method: "DELETE",
      headers: { authorization: "Bearer " + token },
    });
    const delJson = await delRes.json();
    console.log("DELETE", JSON.stringify(delJson));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
