# Sign & Verify Messages

Sign messages and verify signatures with Sui accounts.

## Sign a Message

Use `account.sign()` to produce a cryptographic signature for any string message. This function uses Sui's standard personal message signing format (Ed25519).

```javascript
const message = 'Hello, Sui!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```

## Verify a Signature

Get a read-only account from any `Account` object by calling `account.toReadOnlyAccount()`. Use a read-only account to `verify()` that a signature was produced by the corresponding private key for a given message and address.

```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```

{% hint style="info" %}
You can also create a `WalletAccountReadOnlySui` directly from any public Sui address to verify signatures without access to the private key.
{% endhint %}