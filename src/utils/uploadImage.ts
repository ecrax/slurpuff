export const uploadImage = async (image: File) => {
  const data = new FormData();
  data.append("file", image);
  data.append("upload_preset", "slurpuff");
  data.append("cloud_name", "slurpuff");
  const res = await fetch(
    "https://api.cloudinary.com/v1_1/ecrax/image/upload",
    {
      method: "post",
      body: data,
    }
  );
  const resData = await res.json();
  return resData.url;
};
