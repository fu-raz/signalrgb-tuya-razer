Item {
	anchors.fill: parent

	Column {
		id: headerColumn
		y: 10
		width: parent.width - 20
		spacing: 0
		Text {
			color: theme.primarytextcolor
			text: "First Version of Tuya Razer Connect."
			font.pixelSize: 16
			font.family: "Poppins"
			font.bold: false
			bottomPadding: 10
			width: parent.width
			wrapMode: Text.WordWrap
		}
    }
}
