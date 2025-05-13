export interface AliasArgument {
  selecting: String;

  // alias is an optional field in case the user specifies a non-CSS selector label for the item they're interested in
  alias?: String;
}
