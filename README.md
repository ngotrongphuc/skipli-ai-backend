
# Skipli AI - Back-end

Back-end server for Skipli AI web app


## Run Locally

Clone the project

```bash
  git clone https://github.com/ngotrongphuc/skipli-ai-backend
```

Go to the project directory

```bash
  cd skipli-ai-backend
```

Install dependencies

```bash
  npm install
```

Add .env file at root folder (I will attach it in email)

Start the server

```bash
  node index.js
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY`

`ACCOUNT_SID`

`AUTH_TOKEN`


## Known Issues

Some phone service providers cannot receive messages from Twilio, you can watch server terminal to get the OTP instead


## API Reference

#### Create new access code

```http
  POST /create-new-access-code
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `phoneNumber` | `string` | **Required**. User's phone number |

**Return:** a random 6-digit access code

#### Validate access code

```http
  POST /validate-access-code
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `accessCode` | `string` | **Required**. Access code sent to phone number |
| `phoneNumber` | `string` | **Required**. User's phone number |

**Return:** `{ success: true }`

#### Generate post captions

```http
  POST /generate-post-captions
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `socialNetwork` | `string` | **Required**. Social media provider (Facebook, Instagram, Twitter) |
| `subject` | `string` | **Required**. Subject for captions |
| `tone` | `string` | **Required**. Tone for captions |

**Return:** an array of 5 captions

#### Generate post ideas

```http
  POST /generate-post-ideas
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `topic` | `string` | **Required**. Topic for post ideas |

**Return:** an array of 10 post ideas

#### Generate captions from ideas

```http
  POST /generate-captions-from-ideas
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `idea` | `string` | **Required**. Idea to generate captions |

**Return:** an array of 5 captions

#### Save content

```http
  POST /save-content
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `phoneNumber` | `string` | **Required**. User's phone number |
| `subject` | `string` | **Required**. Subject of caption |
| `caption` | `string` | **Required**. Content of caption |

**Return:** `{ success: true, contentId, captionId }`

#### Get user generated content

```http
  POST /get-user-generated-contents
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `phoneNumber` | `string` | **Required**. User's phone number |

**Return:** a snapshot object of all user saved content

#### Unsave content

```http
  POST /validate-access-code
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `phoneNumber` | `string` | **Required**. User's phone number |
| `contentId` | `string` | **Required**. Id of saved content |
| `captionId` | `string` | **Required**. Id of caption inside saved content |

**Return:** `{ success: true }`

